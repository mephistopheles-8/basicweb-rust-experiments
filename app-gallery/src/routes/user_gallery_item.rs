
use actix_files as fs;
use actix_web::{web,HttpResponse,HttpRequest};
use actix_multipart::Multipart;
use actix_identity::Identity;
use async_std::prelude::*;
use futures::{StreamExt, TryStreamExt};
use bytes::{BytesMut,BufMut};
use serde::{Serialize,Deserialize};
use std::path::Path;
use crate::actions;
use crate::actions::user_gallery_item::*;
use crate::routes::user::UserSession;
use crate::models;
use crate::db::DbPool;
use uuid::Uuid;

pub async fn user_gallery_item_ord_json(
   id: Identity
 , data: web::Json<Vec<models::UserGalleryOrd>>
 , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");

    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        let uuid = *sess.uuid();
        if sess.is_authorized() {
            web::block(move || {
                user_gallery_item_ord(uuid,&data,&conn)
            }).await
              .map_err(|e| {
                eprintln!("{}", e);
                HttpResponse::InternalServerError().finish()
              })?;
            
            Ok(HttpResponse::Ok().finish())
        }else{
            Ok(HttpResponse::Forbidden().finish())
        }
    }else {
        Ok(HttpResponse::Unauthorized().finish())
    }

}

pub async fn user_gallery_items_by_gallery_uuid_json(
    path: web::Path<Uuid>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let items = web::block(move || {
        let gallery = actions::gallery::gallery_by_uuid(*path,&conn)?;
        if gallery.is_some() {
           let items =  user_gallery_items_by_gallery_uuid(*path,&conn)?;
           Ok::<_,diesel::result::Error>(Some(items))
        }else{
           Ok::<_,diesel::result::Error>(None)
        }
    }).await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
   
    if let Some(items) = items {
        Ok(HttpResponse::Ok().json(items))
    }else {
        Ok(HttpResponse::NotFound().finish())
    }
}

pub async fn user_gallery_items_by_url_json(
    path: web::Path<(String,String)>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let items = web::block(move || {
        let (handle,url) = &*path;
        let gallery = actions::user_gallery::user_gallery_by_url(handle,url,&conn)?;
        if gallery.is_some() {
           let items =  user_gallery_items_by_url(handle,url,&conn)?;
           Ok::<_,diesel::result::Error>(Some(items))
        }else{
           Ok::<_,diesel::result::Error>(None)
        }
    }).await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
   
    if let Some(items) = items {
        Ok(HttpResponse::Ok().json(items))
    }else {
        Ok(HttpResponse::NotFound().finish())
    }
}

// first field is GalleryItemUpd json
// next field is the resource file

#[derive(Serialize,Deserialize)]
enum GalleryUploadError {
    InvalidMimeType
}
// TODO: Clean this up....ideally refactor
// some code for reuse...

pub async fn user_gallery_item_multipart(
    id: Identity
  , mut payload: Multipart
  , path: web::Path<Uuid>
  , pool: web::Data<DbPool>
  , permitted : &'static [(i32,&str)]
) -> Result<HttpResponse, actix_web::Error> {

   let conn = pool.get().expect("couldn't get db connection from pool");
   let tmp_dir = std::env::var("TMP_DIR").expect("TMP_DIR");
   let data_dir = std::env::var("USER_ASSET_DIR").expect("USER_ASSET_DIR");

    if let Some(sess) = id.identity() {
       let sess : UserSession = serde_json::from_str(&sess)?;
       let user_uuid = *sess.uuid();
       if sess.is_authorized() {

           let mut buf = BytesMut::new();
           // NOTE: the outstanding mutable reference makes this
           // hang.  You need to process fields in individual blocks.
           // (eg, cannot call payload.try_next().await within this block)
           if let Ok(Some(mut field)) = payload.try_next().await {
                while let Some(chunk) = field.next().await {
                    let data = chunk.unwrap();
                    buf.put(data);
                }
           }

           let item : (models::GalleryItemUpd,models::UserGalleryItemUpd) 
                = serde_json::from_slice(buf.as_ref())
                    .map_err(|_| actix_web::error::ParseError::Incomplete)?;

           let mut err = None;

           if let Ok(Some(mut field)) = payload.try_next().await {

                let resid = Uuid::new_v4();
                let mut resid_buf = [b'!'; 40];

                let tmp_filepath = format!("{}/{}", tmp_dir, resid.to_hyphenated().encode_lower(&mut resid_buf));
                let final_filepath = format!("{}/{}", data_dir, resid.to_hyphenated().encode_lower(&mut resid_buf));
                let mut f = async_std::fs::File::create(&tmp_filepath).await?;

                // Field in turn is stream of *Bytes* object
                while let Some(chunk) = field.next().await {
                    let data = chunk.unwrap();
                    f.write_all(&data).await?;
                }
                f.flush().await?;
                let fp0 = tmp_filepath.clone();
                let fp1 = final_filepath.clone();
                // use web::block to offload blocking Diesel code without blocking server thread
                let uuid = web::block(move || {
                    let p0: &Path = Path::new(&tmp_filepath);
                    let mime = tree_magic::from_filepath(p0);
                    let rkind = permitted.iter().find_map(|&(kind,mime0)| {
                        if mime0 == mime {
                            Some(kind)
                        }else{
                            None
                        } 
                    });
                    if let Some(rkind)  = rkind {
                        let uuid 
                            = user_gallery_item_resource_create_uuid(
                                  user_uuid
                                , &item.0.name
                                , &item.0.description
                                , (item.0.kind
                                ,rkind)
                                , &final_filepath
                                , &mime
                                , *path
                                , &item.1
                                , &conn
                                )?;

                        Ok::<_,diesel::result::Error>(Some(uuid))
                    }else{
                        Ok(None) 
                    }
                }).await
                  .map_err(|e| {
                        eprintln!("{}", e);
                        HttpResponse::InternalServerError().finish()
                  })?;

                if uuid.is_none() {
                    err = Some(GalleryUploadError::InvalidMimeType);
                    async_std::fs::remove_file(&fp0).await?;
                }else{
                    // NOTE: It's important to copy + remove here, since the 
                    // files may be on different filesystems.
                    async_std::fs::copy(&fp0,&fp1).await
                      .map_err(|e| {
                            eprintln!("{}", e);
                            HttpResponse::InternalServerError().finish()
                      })?;
                    async_std::fs::remove_file(&fp0).await?;
                    println!("Success?");
                }
           }
           if err.is_none() {
                Ok(HttpResponse::Ok().into())
           }else {
                Ok(HttpResponse::BadRequest().json(err))
           }
       }else{
            Ok(HttpResponse::Forbidden().finish())
       }
    }else{
        Ok(HttpResponse::Unauthorized().finish())
    }
}

pub async fn user_gallery_item_multipart_image(
    id: Identity
  , payload: Multipart
  , path: web::Path<Uuid>
  , pool: web::Data<DbPool>
) -> Result<HttpResponse, actix_web::Error> {
    user_gallery_item_multipart(id, payload, path, pool, &[ 
        (1, "image/png")
      , (2, "image/jpeg")
      , (3, "image/gif")
    ]).await
}

pub async fn user_gallery_item_serve_by_url(
    req: HttpRequest
  , path: web::Path<(String,String,String)>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let item = web::block(move ||{
        let (handle,gallery_url,item_url) = &*path;
        user_gallery_item_by_url0(handle,gallery_url,item_url,&conn)
    }).await
      .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    if let Some((res,_,_)) = item {
        let file = fs::NamedFile::open(res.filepath)?;
        file
            .use_last_modified(true)
            .set_content_type(res.mime.parse().unwrap())
            .disable_content_disposition()
            .into_response(&req)
    }else{
        Ok(HttpResponse::NotFound().finish())
    }
}


pub async fn user_gallery_item_by_url_json(
    path: web::Path<(String,String,String)>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let item = web::block(move ||{
        let (handle,gallery_url,item_url) = &*path;
        user_gallery_item_by_url(handle,gallery_url,item_url,&conn)
    }).await
      .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    if let Some(item) = item {    
        Ok(HttpResponse::Ok().json(item))
    }else{
        Ok(HttpResponse::NotFound().finish())
    }
}

pub async fn user_gallery_item_by_uuid_json(
    path: web::Path<Uuid>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let item = web::block(move ||
        user_gallery_item_by_uuid(*path,&conn)
     ).await
      .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    if let Some(item) = item {    
        Ok(HttpResponse::Ok().json(item))
    }else{
        Ok(HttpResponse::NotFound().finish())
    }
}


pub async fn user_gallery_item_update_by_uuid_json(
   id: Identity
 , path: web::Path<Uuid>
 , data: web::Json<(models::GalleryItemUpd,models::UserGalleryItemUpd)>
 , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");

    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        let gid = *path;
        let uid = *sess.uuid();
        if sess.is_authorized() {

            let res = web::block(move || {
                if user_owns_gallery_item(uid,gid,&conn)? {
                    let (gdata,ugdata) = &*data;
                    user_gallery_item_update_by_uuid(gid,&gdata,&ugdata,&conn)
                }else{
                    Ok(None)
                }
            }).await
              .map_err(|e| {
                eprintln!("{}", e);
                HttpResponse::InternalServerError().finish()
              })?;
           
             if let Some(res) = res {
                Ok(HttpResponse::Ok().json(res))
             }else{
                // FIXME: handle 404 appropriately?
                Ok(HttpResponse::Forbidden().finish())
             }
        }else{
            Ok(HttpResponse::Forbidden().finish())
        }
    }else {
        Ok(HttpResponse::Unauthorized().finish())
    }

}

pub async fn user_gallery_item_delete_by_uuid_json(
   id: Identity
 , path: web::Path<Uuid>
 , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");

    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        let gid = *path;
        let uid = *sess.uuid();
        if sess.is_authorized() {

            let res = web::block(move || {
                if user_owns_gallery_item(uid,gid,&conn)? {
                    user_gallery_item_delete_by_uuid(gid,&conn)
                }else{
                    Ok(false)
                }
            }).await
              .map_err(|e| {
                eprintln!("{}", e);
                HttpResponse::InternalServerError().finish()
              })?;
           
             if res {
                Ok(HttpResponse::NoContent().finish())
             }else{
                // FIXME: handle 404 appropriately?
                Ok(HttpResponse::Forbidden().finish())
             }
        }else{
            Ok(HttpResponse::Forbidden().finish())
        }
    }else {
        Ok(HttpResponse::Unauthorized().finish())
    }

}

pub async fn user_gallery_item_serve_by_login(
    req: HttpRequest
  , id: Identity
  , path: web::Path<Uuid>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");

    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        let gid = *path;
        let uid = *sess.uuid();
        if sess.is_authorized() {
            let res = web::block(move || 
                user_gallery_item_by_uuid0(uid,gid,&conn)
             ).await
              .map_err(|e| {
                eprintln!("{}", e);
                HttpResponse::InternalServerError().finish()
              })?;
           
             if let Some((res,_,_)) = res {
                let file = fs::NamedFile::open(res.filepath)?;
                file
                    .use_last_modified(true)
                    .set_content_type(res.mime.parse().unwrap())
                    .disable_content_disposition()
                    .into_response(&req)
             }else{
                // FIXME: handle 404 appropriately?
                Ok(HttpResponse::Forbidden().finish())
             }
        }else{
            Ok(HttpResponse::Forbidden().finish())
        }
    }else {
        Ok(HttpResponse::Unauthorized().finish())
    }

}



pub async fn user_gallery_item_url_exists_by_login_json (
    id: Identity
  , path: web::Path<String>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        if sess.is_authorized() {
            let uuid = *sess.uuid();
            let conn = pool.get().expect("couldn't get db connection from pool");
            let exists = web::block(move || user_gallery_item_url_exists(uuid,&path,&conn))
                .await
                .map_err(|e| {
                    eprintln!("{}", e);
                    HttpResponse::InternalServerError().finish()
                })?;
           
            // Eh, make idiomatic http
            if exists {
                Ok(HttpResponse::NoContent().finish())
            }else{
                Ok(HttpResponse::NotFound().finish())
            }

        }else{
            Ok(HttpResponse::Forbidden().finish())
        }
    }else{
        Ok(HttpResponse::Unauthorized().finish())
    }
}

pub async fn user_gallery_items_all_by_tag_login_json (
    id: Identity
  , tag0 : web::Path<String>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        if sess.is_authorized() {
            let uuid = *sess.uuid();
            let conn = pool.get().expect("couldn't get db connection from pool");
            let gallery_items = web::block(move || user_gallery_items_all_by_tag(uuid,&tag0,&conn))
                .await
                .map_err(|e| {
                    eprintln!("{}", e);
                    HttpResponse::InternalServerError().finish()
                })?;
            
            Ok(HttpResponse::Ok().json(gallery_items))


        }else{
            Ok(HttpResponse::Forbidden().finish())
        }
    }else{
        Ok(HttpResponse::Unauthorized().finish())
    }
}

pub async fn user_gallery_items_public_by_tag_json (
    tag0 : web::Path<String>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");
    let gallery_items = web::block(move || user_gallery_items_public_by_tag(&tag0,&conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
    
    Ok(HttpResponse::Ok().json(gallery_items))
}

pub async fn user_gallery_items_public_by_handle_tag_json (
    path : web::Path<(String,String)>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");
    let gallery_items = web::block(move || user_gallery_items_public_by_handle_tag(&path.0,&path.1,&conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
    
    Ok(HttpResponse::Ok().json(gallery_items))
}
