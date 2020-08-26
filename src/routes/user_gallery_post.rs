
use actix_identity::Identity;
use actix_web::{web,HttpResponse};
use crate::db::DbPool;
use uuid::Uuid;
use crate::actions;
use crate::routes::user::UserSession;
use serde::{Serialize,Deserialize};

#[derive(Serialize,Deserialize)]
pub struct UserGalleryPost {
    pub gallery : Uuid,
    pub post : Uuid,
}
#[derive(Serialize,Deserialize)]
pub struct UserGalleryItemPost {
    pub gallery_item : Uuid,
    pub post : Uuid,
}

pub async fn user_gallery_post_json(
   id: Identity
 , data: web::Json<UserGalleryPost>
 , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");

    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        let uuid = *sess.uuid();
        if sess.is_authorized() {
            let success = web::block(move || {
                let owns_gallery =
                    actions::user_gallery::user_owns_gallery(uuid,data.gallery,&conn)?;
                let owns_post =
                    actions::user_post::user_owns_post(uuid,data.post,&conn)?;
                if owns_gallery && owns_post {
                    actions::gallery_post::gallery_post_create_uuid( data.gallery, data.post, &conn)?;
                    Ok::<_,diesel::result::Error>(true)
                }else{
                    Ok::<_,diesel::result::Error>(false)
                }
            }).await
              .map_err(|e| {
                eprintln!("{}", e);
                HttpResponse::InternalServerError().finish()
              })?;

            if success {
                Ok(HttpResponse::Ok().finish())
            }else{
                Ok(HttpResponse::Forbidden().finish())
            }
        }else{
            Ok(HttpResponse::Forbidden().finish())
        }
    }else {
        Ok(HttpResponse::Unauthorized().finish())
    }

}

pub async fn user_gallery_item_post_json(
   id: Identity
 , data: web::Json<UserGalleryItemPost>
 , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");

    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        let uuid = *sess.uuid();
        if sess.is_authorized() {
            let success = web::block(move || {
                let owns_gallery_item =
                    actions::user_gallery_item::user_owns_gallery_item(uuid,data.gallery_item,&conn)?;
                let owns_post =
                    actions::user_post::user_owns_post(uuid,data.post,&conn)?;
                if owns_gallery_item && owns_post {
                    actions::gallery_item_post::gallery_item_post_create_uuid( data.gallery_item, data.post, &conn)?;
                    Ok::<_,diesel::result::Error>(true)
                }else{
                    Ok::<_,diesel::result::Error>(false)
                }
            }).await
              .map_err(|e| {
                eprintln!("{}", e);
                HttpResponse::InternalServerError().finish()
              })?;

            if success {
                Ok(HttpResponse::Ok().finish())
            }else{
                Ok(HttpResponse::Forbidden().finish())
            }
        }else{
            Ok(HttpResponse::Forbidden().finish())
        }
    }else {
        Ok(HttpResponse::Unauthorized().finish())
    }

}
