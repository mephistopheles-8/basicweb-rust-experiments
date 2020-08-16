
#[macro_use]
extern crate diesel;
#[macro_use]
extern crate serde_json;

use handlebars::Handlebars;
use actix_web::{web,HttpResponse};
use diesel::prelude::*;
use diesel::r2d2::{self, ConnectionManager};
use uuid::Uuid;

pub mod schema;
pub mod models;
pub mod util;

pub type DbPool = r2d2::Pool<ConnectionManager<SqliteConnection>>;

pub fn post_create( 
        post0: &models::PostPost, conn: &SqliteConnection 
    ) -> Result<Uuid, diesel::result::Error> {

    use crate::schema::posts::dsl::*;

    let uuid0 = Uuid::new_v4();

    let new_post = models::NewPost {
        parent: None,
        depth: 0,
        title: post0.title.as_deref(),
        description: post0.description.as_deref(),
        body: &post0.body,
        status: 0,
        uuid: uuid0.as_bytes(),
    };

    diesel::insert_into(posts).values(&new_post).execute(conn)?;
    Ok(uuid0)
}

pub fn post_reply_create(
      parent0: &models::Post
    , post0: &models::PostPost
    , conn: &SqliteConnection 
    ) -> Result<Uuid, diesel::result::Error> {

    use crate::schema::posts::dsl::*;

    let uuid0 = Uuid::new_v4();

    let new_post = models::NewPost {
        parent: Some(parent0.id),
        depth: parent0.depth + 1,
        title: post0.title.as_deref(),
        description: post0.description.as_deref(),
        body: &post0.body,
        status: 0,
        uuid: uuid0.as_bytes(),
    };

    diesel::insert_into(posts).values(&new_post).execute(conn)?;
    Ok(uuid0)
}

pub fn posts_root ( n: i64, page: i64, conn: &SqliteConnection ) 
    -> Result<Vec<models::Post>, diesel::result::Error> {

    use crate::schema::posts::dsl::*;
    let g0s = 
        posts.filter(parent.is_null().and(status.eq(0)))
            .order_by(created.desc())
            .limit(n)
            .offset(n*page)
            .load( conn )?;
    Ok(g0s)
}

pub fn post_replies ( pid0: i32, n: i64, page: i64, conn: &SqliteConnection ) 
    -> Result<Vec<models::Post>, diesel::result::Error> {

    use crate::schema::posts::dsl::*;
    let g0s = 
        posts.filter(parent.eq(pid0))
            .order_by(created.asc())
            .limit(n)
            .offset(n*page)
            .load( conn )?;
    Ok(g0s)
}

pub fn post_by_id ( id0: i32, conn: &SqliteConnection ) 
    -> Result<Option<models::Post>, diesel::result::Error> {

    use crate::schema::posts::dsl::*;
    let g0s = posts
             .filter(id.eq(id0))
             .first::<models::Post>( conn )
             .optional()?; 
    Ok(g0s)
}

pub fn post_by_uuid ( uuid0: Uuid, conn: &SqliteConnection ) 
    -> Result<Option<models::Post>, diesel::result::Error> {

    use crate::schema::posts::dsl::*;
    let g0s = posts
              .filter(uuid.eq(uuid0.as_bytes().as_ref()))
              .first::<models::Post>( conn )
              .optional()?; 
    Ok(g0s)
}

pub fn post_delete_by_id ( id0: i32, conn: &SqliteConnection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::posts::dsl::*;
    diesel::delete(posts.filter(id.eq(id0))).execute(conn)
}

pub fn post_delete_by_uuid ( uuid0: Uuid, conn: &SqliteConnection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::posts::dsl::*;
    diesel::delete(posts.filter(uuid.eq(uuid0.as_bytes().as_ref()))).execute(conn)
}

pub fn post_update_by_id( 
        data: &models::PostPost, id0: i32, conn: &SqliteConnection 
    ) -> Result<usize, diesel::result::Error> {

    use crate::schema::posts::dsl::*;

    diesel::update(posts.filter(id.eq(id0))).set(data).execute(conn)
}

pub fn post_update_by_uuid( 
        data: &models::PostPost, uuid0: Uuid, conn: &SqliteConnection 
    ) -> Result<usize, diesel::result::Error> {

    use crate::schema::posts::dsl::*;

    diesel::update(posts.filter(uuid.eq(uuid0.as_bytes().as_ref()))).set(data).execute(conn)
}

pub fn post_update_title_by_id ( title0: Option<&str>, id0: i32, conn: &SqliteConnection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::posts::dsl::*;
    diesel::update(posts.filter(id.eq(id0))).set(title.eq(title0)).execute(conn)
}

pub fn post_update_description_by_id ( description0: Option<&str>, id0: i32, conn: &SqliteConnection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::posts::dsl::*;
    diesel::update(posts.filter(id.eq(id0))).set(description.eq(description0)).execute(conn)
}

pub fn post_update_body_by_id ( body0: &str, id0: i32, conn: &SqliteConnection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::posts::dsl::*;
    diesel::update(posts.filter(id.eq(id0))).set(body.eq(body0)).execute(conn)
}


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

pub async fn index(hb: web::Data<Handlebars<'_>>) -> HttpResponse {
    let data = json!({
        "title": "Welcome"
      , "parent" : "main"
    });
    let body = hb.render("content/index", &data).unwrap();

    HttpResponse::Ok().body(body)
}

pub fn min_api( cfg: &mut web::ServiceConfig ) {
    cfg
      .service(web::resource("/").route(web::get().to(index)))
      .service(web::resource("/posts")
          .route(web::get().to(posts_root_default_json))
          .route(web::post().to(post_create_json))
      )
      .service(web::resource("/posts/{id}")
          .route(web::get().to(post_by_id_json))
          .route(web::post().to(post_update_by_id_json))
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

