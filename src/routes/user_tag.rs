
use actix_identity::Identity;
use actix_web::{web,HttpResponse};
use crate::actions::user_tag::*;
use crate::db::DbPool;
use crate::routes::user::UserSession;

pub async fn user_tags_public_json (
   pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let tags = web::block(move || user_tags_public(&conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
    
    Ok(HttpResponse::Ok().json(tags))
}

pub async fn user_tags_public_by_handle_json (
     path: web::Path<String>
  ,  pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let tags = web::block(move || user_tags_public_by_handle(&path,&conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
    
    Ok(HttpResponse::Ok().json(tags))
}


pub async fn user_tags_all_by_login_json (
     id: Identity
  ,  pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        let uuid = *sess.uuid();
        if sess.is_authorized() {
            let tags = web::block(move || 
                user_tags_all_by_uuid(uuid,&conn)
             ).await
              .map_err(|e| {
                eprintln!("{}", e);
                HttpResponse::InternalServerError().finish()
              })?;
            
            Ok(HttpResponse::Ok().json(tags))
        }else{
            Ok(HttpResponse::Forbidden().finish())
        }
    }else {
        Ok(HttpResponse::Unauthorized().finish())
    }

}

