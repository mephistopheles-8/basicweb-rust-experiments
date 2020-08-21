use handlebars::Handlebars;
use actix_web::{web,HttpResponse};
use crate::models;
use crate::actions::post::*;
use crate::db::DbPool;

pub async fn post_create_json(
     data : web::Json<models::PostPost>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let uuid = web::block(move || post_create(&data, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    Ok(HttpResponse::Ok().json(uuid))
}

pub async fn post_reply_create_json(
     path : web::Path<i32>
   , data : web::Json<models::PostPost>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let uuid = web::block(move || {
        let post = post_by_id(*path,&conn)?;
        if let Some(post) = post {
             let uuid = post_reply_create(&post, &data, &conn)?;
             Ok::<_,diesel::result::Error>(Some(uuid))
        }else{
            Ok::<_,diesel::result::Error>(None)
        }
    })
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    if let Some(uuid) = uuid {
        Ok(HttpResponse::Ok().json(uuid))
    }else{
        Ok(HttpResponse::NotFound().finish())
    }
}

pub async fn posts_all_default_json(
    pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let posts = web::block(move || posts_all(&conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
    
    Ok(HttpResponse::Ok().json(posts))
}

pub async fn posts_all_json(
    path: web::Path<(i64,i64)>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let posts = web::block(move || posts_all_paginated(path.0,path.1,&conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
    
    Ok(HttpResponse::Ok().json(posts))
}


pub async fn posts_root_default_json(
    pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let posts = web::block(move || posts_root(64,0,&conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
    
    Ok(HttpResponse::Ok().json(posts))
}

pub async fn posts_root_json(
    path: web::Path<(i64,i64)>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let posts = web::block(move || posts_root(path.0,path.1,&conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
    
    Ok(HttpResponse::Ok().json(posts))
}

pub async fn posts_replies_default_json(
    path: web::Path<i32>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let posts = web::block(move || {
        let parent = post_by_id(*path,&conn)?;
        if parent.is_some() {
            let replies = post_replies(*path,64,0,&conn)?;
            Ok::<_,diesel::result::Error>(Some(replies))
        }else{
            Ok(None)

        }
    })
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
   
    if let Some(posts) = posts {
        Ok(HttpResponse::Ok().json(posts))
    }else {
        Ok(HttpResponse::NotFound().finish())
    }
}

pub async fn posts_replies_json(
    path: web::Path<(i32,i64,i64)>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let posts = web::block(move || {
        let parent = post_by_id(path.0,&conn)?;
        if parent.is_some() {
            let replies = post_replies(path.0,path.1,path.2,&conn)?;
            Ok::<_,diesel::result::Error>(Some(replies))
        }else{
            Ok(None)

        }
    })
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
   
    if let Some(posts) = posts {
        Ok(HttpResponse::Ok().json(posts))
    }else {
        Ok(HttpResponse::NotFound().finish())
    }
}

pub async fn posts_thread_default_json(
    path: web::Path<i32>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let posts = web::block(move || {
        let parent = post_by_id(*path,&conn)?;
        if parent.is_some() {
            let replies = post_thread_full(*path,&conn)?;
            Ok::<_,diesel::result::Error>(Some(replies))
        }else{
            Ok(None)

        }
    })
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
   
    if let Some(posts) = posts {
        Ok(HttpResponse::Ok().json(posts))
    }else {
        Ok(HttpResponse::NotFound().finish())
    }
}


pub async fn posts_thread_json(
    path: web::Path<(i32,i64)>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let posts = web::block(move || {
        let parent = post_by_id(path.0,&conn)?;
        if parent.is_some() {
            let replies = post_thread(path.0,path.1,&conn)?;
            Ok::<_,diesel::result::Error>(Some(replies))
        }else{
            Ok(None)

        }
    })
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
   
    if let Some(posts) = posts {
        Ok(HttpResponse::Ok().json(posts))
    }else {
        Ok(HttpResponse::NotFound().finish())
    }
}


pub async fn post_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let loc = web::block(move || post_by_id(*path, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    if let Some(loc) = loc {
        Ok(HttpResponse::Ok().json(loc))
    }else {
        Ok(HttpResponse::NotFound().finish())
    }
}

pub async fn post_title_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let loc = web::block(move || post_by_id(*path, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
    if let Some(loc) = loc {
        Ok(HttpResponse::Ok().json(loc.title))
    }else {
        Ok(HttpResponse::NotFound().finish())
    }
}

pub async fn post_description_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let loc = web::block(move || post_by_id(*path, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
    if let Some(loc) = loc {
        Ok(HttpResponse::Ok().json(loc.description))
    }else {
        Ok(HttpResponse::NotFound().finish())
    }
}

pub async fn post_body_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let loc = web::block(move || post_by_id(*path, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
    if let Some(loc) = loc {
        Ok(HttpResponse::Ok().json(loc.body))
    }else {
        Ok(HttpResponse::NotFound().finish())
    }
}

pub async fn post_delete_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || post_delete_by_id(*path, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    Ok(HttpResponse::NoContent().finish())
}

pub async fn post_update_by_id_json(
     path: web::Path<i32>
   , data : web::Json<models::PostPost>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    let id = *path;
    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || post_update_by_id(&data,id, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    post_by_id_json(path,pool).await
}

pub async fn post_update_title_by_id_json(
     path: web::Path<i32>
   , data: web::Json<Option<String>>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    let id = *path;
    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || post_update_title_by_id(data.as_deref(), id, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    post_title_by_id_json(path,pool).await
}

pub async fn post_update_description_by_id_json(
     path: web::Path<i32>
   , data: web::Json<Option<String>>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    let id = *path;
    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || post_update_description_by_id(data.as_deref(), id, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    post_description_by_id_json(path,pool).await
}

pub async fn post_update_body_by_id_json(
     path: web::Path<i32>
   , data: web::Json<String>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    let id = *path;
    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || post_update_body_by_id(&data, id, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    post_body_by_id_json(path,pool).await
}

pub async fn index(
    hb: web::Data<Handlebars<'_>>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse, actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let posts = web::block(move || posts_root(64,0,&conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
    
    let data = json!({
        "title": "Welcome"
      , "parent" : "main"
      , "posts" : posts
    });
    let body = hb.render("content/index", &data).unwrap();

    Ok(HttpResponse::Ok().body(body))
}

pub async fn post_thread_html(
     path: web::Path<i32>
   , hb: web::Data<Handlebars<'_>>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");
    let id = *path;
    let posts = web::block(move || {
        let parent = post_by_id(id,&conn)?;
        if parent.is_some() {
            let replies = post_thread_full(id,&conn)?;
            Ok::<_,diesel::result::Error>(Some(replies))
        }else{
            Ok(None)

        }
    }).await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
   
    if let Some(posts) = posts {
        let data = json!({
            "title": "Thread"
          , "parent" : "main"
          , "data" : posts
        });
        let body = hb.render("content/thread", &data).unwrap();
        Ok(HttpResponse::Ok().body(body))
    }else {
        Ok(HttpResponse::NotFound().finish())
    }
}

pub fn api_html( cfg: &mut web::ServiceConfig ) {
    cfg
      .service(web::resource("/").route(web::get().to(index)))
      .service(web::resource("/posts/{id}")
          .route(web::get().to(post_thread_html))
      )
      ;
}

pub fn api_v1_json( cfg: &mut web::ServiceConfig ) {
    cfg
      .service(web::resource("/").route(web::get().to(index)))
      .service(web::resource("/posts")
          .route(web::get().to(posts_root_default_json))
          .route(web::post().to(post_create_json))
      )
      .service(web::resource("/posts/all")
          .route(web::get().to(posts_all_default_json))
      )
      .service(web::resource("/posts/all/{n}/{page}")
          .route(web::get().to(posts_all_json))
      )
      .service(web::resource("/posts/{id}")
          .route(web::get().to(post_by_id_json))
          .route(web::post().to(post_update_by_id_json))
        )
      .service(web::resource("/posts/{id}/thread")
          .route(web::get().to(posts_thread_default_json))
      )
      .service(web::resource("/posts/{id}/thread/{depth}")
          .route(web::get().to(posts_thread_json))
      )
      .service(web::resource("/posts/{id}/replies")
          .route(web::get().to(posts_replies_default_json))
          .route(web::post().to(post_reply_create_json))
        )
      .service(web::resource("/posts/{id}/replies/{n}/{page}")
          .route(web::get().to(posts_replies_json))
        )
      .service(web::resource("/posts/{id}/title")
          .route(web::get().to(post_title_by_id_json))
          .route(web::post().to(post_update_title_by_id_json))
        )
      .service(web::resource("/posts/{id}/description")
          .route(web::get().to(post_description_by_id_json))
          .route(web::post().to(post_update_description_by_id_json))
        )
      .service(web::resource("/posts/{id}/body")
          .route(web::get().to(post_body_by_id_json))
          .route(web::post().to(post_update_body_by_id_json))
        )
      .service(web::resource("/posts/{n}/{page}")
          .route(web::get().to(posts_root_json))
        )
      ;
}

