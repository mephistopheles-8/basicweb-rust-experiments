
use actix_identity::Identity;
use actix_web::{web,HttpResponse};
use crate::actions::user_gallery::*;
use crate::models;
use crate::db::DbPool;
use uuid::Uuid;
use crate::routes::user::UserSession;
use handlebars::Handlebars;

pub async fn user_gallery_ord_json(
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
                user_gallery_ord(uuid,&data,&conn)
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

pub async fn user_gallery_create_json(
   id: Identity
 , data: web::Json<(models::GalleryUpd,models::UserGalleryUpd)>
 , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");

    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        let uuid = *sess.uuid();
        if sess.is_authorized() {
            let uuid1 = web::block(move || {
                let (gdata,ugdata) = &*data;
                user_gallery_create0_uuid(uuid,&gdata,&ugdata,&conn)
            }).await
              .map_err(|e| {
                eprintln!("{}", e);
                HttpResponse::InternalServerError().finish()
              })?;
            
            Ok(HttpResponse::Ok().json(uuid1))
        }else{
            Ok(HttpResponse::Forbidden().finish())
        }
    }else {
        Ok(HttpResponse::Unauthorized().finish())
    }

}

pub async fn user_gallery_delete_by_uuid_json(
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
                if user_owns_gallery(uid,gid,&conn)? {
                    user_gallery_delete_by_uuid(gid,&conn)
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

pub async fn user_gallery_update_by_uuid_json(
   id: Identity
 , path: web::Path<Uuid>
 , data: web::Json<(models::GalleryUpd,models::UserGalleryUpd)>
 , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");

    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        let gid = *path;
        let uid = *sess.uuid();
        if sess.is_authorized() {

            let res = web::block(move || {
                if user_owns_gallery(uid,gid,&conn)? {
                    let (gdata,ugdata) = &*data;
                    user_gallery_update_by_uuid(gid,&gdata,&ugdata,&conn)
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

// TODO: access control
pub async fn user_gallery_by_uuid_json(
    path: web::Path<Uuid> 
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let gallery = web::block(move || 
        user_gallery_by_uuid(*path,&conn)
     ).await
      .map_err(|e| {
        eprintln!("{}", e);
        HttpResponse::InternalServerError().finish()
      })?;
            
    Ok(HttpResponse::Ok().json(gallery))
}

pub async fn user_gallery_by_url_json(
    path: web::Path<(String,String)> 
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let gallery = web::block(move || {
        let (handle,url) = &*path;
        user_gallery_by_url(handle,url,&conn)
    }).await
      .map_err(|e| {
        eprintln!("{}", e);
        HttpResponse::InternalServerError().finish()
      })?;
            
    Ok(HttpResponse::Ok().json(gallery))
}

pub async fn user_gallery_create_form(
      id: Identity
    , hb: web::Data<Handlebars<'_>>
  ) -> Result<HttpResponse,actix_web::Error> {
    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        if sess.is_authorized() {
            let data = json!({
                "title": "Add New Gallery"
              , "parent" : "main"
              , "logged_in" : true
            });
            let body = hb.render("content/user-gallery-create-dynamic", &data).unwrap();

            Ok(HttpResponse::Ok().body(body))
        }else{
            Ok(HttpResponse::Forbidden().finish())
        }
    }else{
        Ok(HttpResponse::Found().header("location", "/login").finish())

    }
}

pub async fn user_galleries_by_login_json (
    id: Identity
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        if sess.is_authorized() {
            let uuid = *sess.uuid();
            let conn = pool.get().expect("couldn't get db connection from pool");
            let galleries = web::block(move || user_galleries_by_user_uuid(uuid,&conn))
                .await
                .map_err(|e| {
                    eprintln!("{}", e);
                    HttpResponse::InternalServerError().finish()
                })?;
            
            Ok(HttpResponse::Ok().json(galleries))


        }else{
            Ok(HttpResponse::Forbidden().finish())
        }
    }else{
        Ok(HttpResponse::Unauthorized().finish())
    }
}

pub async fn user_galleries_by_login_html(
    id: Identity
  , hb: web::Data<Handlebars<'_>>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        if sess.is_authorized() {
            let uuid = *sess.uuid();
            let conn = pool.get().expect("couldn't get db connection from pool");
            let galleries = web::block(move || user_galleries_by_user_uuid(uuid,&conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
 
            let data = json!({
                "title": "Galleries"
              , "parent" : "main"
              , "galleries" : galleries
              , "logged_in" : true
            });
            let body = hb.render("content/user-gallery-listing", &data).unwrap();

            Ok(HttpResponse::Ok().body(body))
        }else{
            Ok(HttpResponse::Forbidden().finish())
        }
    }else{
        Ok(HttpResponse::Found().header("location", "/login").finish())
    }
}

pub async fn user_galleries_by_login_dynamic_html(
    id: Identity
  , hb: web::Data<Handlebars<'_>>
  ) -> Result<HttpResponse,actix_web::Error> {
    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        if sess.is_authorized() {
            let data = json!({
                "title": "Galleries"
              , "parent" : "main"
              , "logged_in" : true
            });
            let body = hb.render("content/user-gallery-listing-dynamic", &data).unwrap();

            Ok(HttpResponse::Ok().body(body))
        }else{
            Ok(HttpResponse::Forbidden().finish())
        }
    }else{
        Ok(HttpResponse::Found().header("location", "/login").finish())
    }
}

pub async fn user_gallery_by_login_html(
    id: Identity
  , path: web::Path<Uuid>
  , hb: web::Data<Handlebars<'_>>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        if sess.is_authorized() {
            let uid = *sess.uuid();
            let gid = *path;
            let conn = pool.get().expect("couldn't get db connection from pool");
            let gallery = web::block(move ||
                    user_owned_gallery_by_uuid(uid,gid,&conn)
                ).await
                .map_err(|e| {
                    eprintln!("{}", e);
                    HttpResponse::InternalServerError().finish()
                })?;

            
            if let Some(gallery) = gallery {
                let data = json!({
                    "title": format!("Gallery - {}", gallery.1.name)
                  , "parent" : "main"
                  , "galleryId": gid
                  , "logged_in" : true
                });
                let body = hb.render("content/user-gallery", &data).unwrap();
                Ok(HttpResponse::Ok().body(body))
            }else{
                // FIXME: 404?
                Ok(HttpResponse::Forbidden().finish())
            }
        }else{
            Ok(HttpResponse::Forbidden().finish())
        }
    }else{
        Ok(HttpResponse::Found().header("location", "/login").finish())
    }
}
