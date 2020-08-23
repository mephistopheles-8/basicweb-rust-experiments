
use actix_files as fs;
use actix_web::{web,HttpRequest,HttpResponse};
use actix_multipart::Multipart;
use async_std::prelude::*;
use futures::{StreamExt, TryStreamExt};
use bytes::{BytesMut,BufMut};
use serde::{Serialize,Deserialize};
use uuid::Uuid;
use std::path::Path;
use handlebars::Handlebars;
use crate::db::DbPool;
use crate::models;
use crate::actions::gallery_item::*;
use crate::actions::gallery::*;
use crate::actions::resource::*;

pub async fn gallery_items_json(
    path: web::Path<Uuid>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let items = web::block(move || {
        let gallery = gallery_by_uuid(*path,&conn)?;
        if gallery.is_some() {
           let items =  gallery_items_by_gallery_uuid(*path,&conn)?;
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


// first field is GalleryItemPost json
// next field is the resource file

#[derive(Serialize,Deserialize)]
enum GalleryUploadError {
    InvalidMimeType
}

pub async fn gallery_item_multipart(
    mut payload: Multipart
  , path: web::Path<Uuid>
  , pool: web::Data<DbPool>
  , permitted : &'static [(i32,&str)]
) -> Result<HttpResponse, actix_web::Error> {

   let conn = pool.get().expect("couldn't get db connection from pool");

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

   let item : models::GalleryItemPost 
        = serde_json::from_slice(buf.as_ref())
            .map_err(|_| actix_web::error::ParseError::Incomplete)?;

   let mut err = None;

   if let Ok(Some(mut field)) = payload.try_next().await {

        let resid = Uuid::new_v4();
        let mut resid_buf = [b'!'; 40];

        let filepath = format!("./tmp/{}", resid.to_hyphenated().encode_lower(&mut resid_buf));
        let mut f = async_std::fs::File::create(&filepath).await?;

        // Field in turn is stream of *Bytes* object
        while let Some(chunk) = field.next().await {
            let data = chunk.unwrap();
            f.write_all(&data).await?;
        }
        f.flush().await?;
        let fp0 = filepath.clone();
        // use web::block to offload blocking Diesel code without blocking server thread
        let uuid = web::block(move || {
            let p0: &Path = Path::new(&filepath);
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
                    = gallery_item_resource_create_uuid(
                        &item.name, &item.description, (item.kind,rkind), &filepath, &mime, *path, &conn)?;

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
        }
   }
   if err.is_none() {
        Ok(HttpResponse::Ok().into())
   }else {
        Ok(HttpResponse::BadRequest().json(err))
   }
}

pub async fn gallery_item_multipart_image(
    payload: Multipart
  , path: web::Path<Uuid>
  , pool: web::Data<DbPool>
) -> Result<HttpResponse, actix_web::Error> {
    gallery_item_multipart( payload, path, pool, &[ 
        (1, "image/png")
      , (2, "image/jpeg")
      , (3, "image/gif")
    ]).await
}


pub async fn gallery_item_serve(
    req: HttpRequest
  , path: web::Path<Uuid>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let item = web::block(move || gallery_item_by_uuid(*path,&conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    if let Some((_,res)) = item {
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

pub async fn gallery_item_json(
    path: web::Path<(Uuid,Uuid)>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let item = web::block(move || gallery_item_by_uuid0(path.1,path.0,&conn))
        .await
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

pub async fn gallery_item_form(
    path: web::Path<Uuid>,
    hb: web::Data<Handlebars<'_>>
    ) -> HttpResponse {
    let data = json!({
        "title": "Add New Gallery Item"
      , "parent" : "main"
      , "action": format!("/galleries/{}/items", *path)
    });
    let body = hb.render("content/gallery-item-create", &data).unwrap();

    HttpResponse::Ok().body(body)
}
