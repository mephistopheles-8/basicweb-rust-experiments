
use actix_identity::Identity;
use actix_web::{web,HttpResponse};
use crate::actions::user_post::*;
use crate::{models,actions};
use crate::db::DbPool;
use uuid::Uuid;
use crate::routes::user::UserSession;
use handlebars::Handlebars;


pub async fn user_post_ord_json(
   id: Identity
 , data: web::Json<Vec<models::UserPostOrd>>
 , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");

    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        let uuid = *sess.uuid();
        if sess.is_authorized() {
            web::block(move || {
                user_post_ord(uuid,&data,&conn)
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
            let post = web::block(move || {
                let (gdata,ugdata) = &*data;
                let uuid = user_post_create0_uuid(uuid,&gdata,&ugdata,&conn)?;
                user_post_by_uuid(uuid,&conn)
            }).await
              .map_err(|e| {
                eprintln!("{}", e);
                HttpResponse::InternalServerError().finish()
              })?;
            
            Ok(HttpResponse::Ok().json(post))
        }else{
            Ok(HttpResponse::Forbidden().finish())
        }
    }else {
        Ok(HttpResponse::Unauthorized().finish())
    }

}

pub async fn user_post_update_json(
   id: Identity
 , path: web::Path<Uuid>
 , data: web::Json<(models::PostUpd,models::UserPostUpd)>
 , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");

    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        let uid = *sess.uuid();
        let pid = *path;
        if sess.is_authorized() {
            let found = web::block(move || {
                let (gdata,ugdata) = &*data;
                user_post_update0_uuid(uid,pid,&gdata,&ugdata,&conn)
            }).await
              .map_err(|e| {
                eprintln!("{}", e);
                HttpResponse::InternalServerError().finish()
              })?;

            if found {
                user_post_by_uuid_json(path,pool).await
            }else{
                Ok(HttpResponse::NotFound().finish())
            }
        }else{
            Ok(HttpResponse::Forbidden().finish())
        }
    }else {
        Ok(HttpResponse::Unauthorized().finish())
    }
}

pub async fn user_post_delete_by_uuid_json(
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
                if user_owns_post(uid,gid,&conn)? {
                    user_post_delete_by_uuid(gid,&conn)
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

pub async fn user_post_by_uuid_auth_json(
   id: Identity
 , path: web::Path<Uuid>
 , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");

    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        let uid = *sess.uuid();
        let pid = *path;
        if sess.is_authorized() {
            let found = web::block(move || {
                user_owns_post(uid,pid,&conn)
            }).await
              .map_err(|e| {
                eprintln!("{}", e);
                HttpResponse::InternalServerError().finish()
              })?;

            if found {
                user_post_by_uuid_json(path,pool).await
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

pub async fn user_posts_by_url_json(
    path: web::Path<String> 
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let posts = web::block(move || {
        let user = actions::user::user_by_handle(&path,&conn)?;
        if user.is_some() {
            let posts = user_posts_by_user_handle(&path,&conn)?;
            Ok::<_,diesel::result::Error>(Some(posts))
        }else{
            Ok(None)
        }
    }).await
      .map_err(|e| {
        eprintln!("{}", e);
        HttpResponse::InternalServerError().finish()
      })?;
    if let Some(posts) = posts {
        Ok(HttpResponse::Ok().json(posts))
    }else{
        Ok(HttpResponse::NotFound().finish())
    }
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
              , "logged_in" : true
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

pub async fn user_post_update_form(
      id: Identity
    , path: web::Path<Uuid>
    , hb: web::Data<Handlebars<'_>>
    , pool : web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        if sess.is_authorized() {
            let uid = *sess.uuid();
            let pid = *path;

            let owns_post = web::block(move || 
                user_owns_post(uid,pid,&conn)
            ).await
              .map_err(|e| {
                eprintln!("{}", e);
                HttpResponse::InternalServerError().finish()
              })?;

            if owns_post {
                let data = json!({
                    "title": "Add New Post"
                  , "parent" : "main"
                  , "logged_in" : true
                  , "postId" : pid
                });
                let body = hb.render("content/user-post-update-dynamic", &data).unwrap();

                Ok(HttpResponse::Ok().body(body))
            }else{
                Ok(HttpResponse::Forbidden().finish())
            }
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

pub async fn user_posts_by_login_dynamic_html(
    id: Identity
  , hb: web::Data<Handlebars<'_>>
  ) -> Result<HttpResponse,actix_web::Error> {
    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        if sess.is_authorized() {
            let data = json!({
                "title": "Posts"
              , "parent" : "main"
              , "logged_in" : true
            });
            let body = hb.render("content/user-post-listing-dynamic", &data).unwrap();

            Ok(HttpResponse::Ok().body(body))
        }else{
            Ok(HttpResponse::Forbidden().finish())
        }
    }else{
        Ok(HttpResponse::Found().header("location", "/login").finish())
    }
}

pub async fn user_post_url_exists_by_login_json (
    id: Identity
  , path: web::Path<String>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        if sess.is_authorized() {
            let uuid = *sess.uuid();
            let conn = pool.get().expect("couldn't get db connection from pool");
            let exists = web::block(move || user_post_url_exists(uuid,&path,&conn))
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
