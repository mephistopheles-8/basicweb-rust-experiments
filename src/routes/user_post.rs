
use actix_identity::Identity;
use actix_web::{web,HttpResponse};
use crate::actions::user_post::*;
use crate::models;
use crate::db::DbPool;
use uuid::Uuid;
use crate::routes::user::UserSession;
use handlebars::Handlebars;


pub async fn user_post_create_json(
   id: Identity
 , data: web::Json<(models::PostUpd,models::UserPostUpd)>
 , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");

    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        let uuid = *sess.uuid();
        if sess.is_authorized() {
            let uuid1 = web::block(move || {
                let (gdata,ugdata) = &*data;
                user_post_create0_uuid(uuid,&gdata,&ugdata,&conn)
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

// TODO: access control
pub async fn user_post_by_uuid_json(
    path: web::Path<Uuid> 
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let post = web::block(move || 
        user_post_by_uuid(*path,&conn)
     ).await
      .map_err(|e| {
        eprintln!("{}", e);
        HttpResponse::InternalServerError().finish()
      })?;
            
    Ok(HttpResponse::Ok().json(post))
}

pub async fn user_post_by_url_json(
    path: web::Path<(String,String)> 
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let post = web::block(move || {
        let (handle,url) = &*path;
        user_post_by_url(handle,url,&conn)
    }).await
      .map_err(|e| {
        eprintln!("{}", e);
        HttpResponse::InternalServerError().finish()
      })?;
            
    Ok(HttpResponse::Ok().json(post))
}

pub async fn user_post_create_form(
      id: Identity
    , hb: web::Data<Handlebars<'_>>
  ) -> Result<HttpResponse,actix_web::Error> {
    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        if sess.is_authorized() {
            let data = json!({
                "title": "Add New Post"
              , "parent" : "main"
            });
            let body = hb.render("content/user-post-create-dynamic", &data).unwrap();

            Ok(HttpResponse::Ok().body(body))
        }else{
            Ok(HttpResponse::Forbidden().finish())
        }
    }else{
        Ok(HttpResponse::Found().header("location", "/login").finish())

    }
}

pub async fn user_posts_by_login_json (
    id: Identity
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        if sess.is_authorized() {
            let uuid = *sess.uuid();
            let conn = pool.get().expect("couldn't get db connection from pool");
            let posts = web::block(move || user_posts_by_user_uuid(uuid,&conn))
                .await
                .map_err(|e| {
                    eprintln!("{}", e);
                    HttpResponse::InternalServerError().finish()
                })?;
            
            Ok(HttpResponse::Ok().json(posts))


        }else{
            Ok(HttpResponse::Forbidden().finish())
        }
    }else{
        Ok(HttpResponse::Unauthorized().finish())
    }
}
