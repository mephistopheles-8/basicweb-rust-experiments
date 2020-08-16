
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

pub fn item_create( 
        item0: &models::ItemPost, conn: &SqliteConnection 
    ) -> Result<Uuid, diesel::result::Error> {

    use crate::schema::items::dsl::*;

    let uuid0 = Uuid::new_v4();

    let new_item = models::NewItem {
        name: &item0.name,
        description: item0.description.as_deref(),
        uuid: uuid0.as_bytes(),
    };

    diesel::insert_into(items).values(&new_item).execute(conn)?;
    Ok(uuid0)
}

pub fn items_all ( conn: &SqliteConnection ) 
    -> Result<Vec<models::Item>, diesel::result::Error> {

    use crate::schema::items::dsl::*;
    let g0s = items.order_by(name).load( conn )?; 
    Ok(g0s)
}

pub fn item_by_id ( id0: i32, conn: &SqliteConnection ) 
    -> Result<Option<models::Item>, diesel::result::Error> {

    use crate::schema::items::dsl::*;
    let g0s = items
             .filter(id.eq(id0))
             .first::<models::Item>( conn )
             .optional()?; 
    Ok(g0s)
}

pub fn item_by_uuid ( uuid0: Uuid, conn: &SqliteConnection ) 
    -> Result<Option<models::Item>, diesel::result::Error> {

    use crate::schema::items::dsl::*;
    let g0s = items
              .filter(uuid.eq(uuid0.as_bytes().as_ref()))
              .first::<models::Item>( conn )
              .optional()?; 
    Ok(g0s)
}

pub fn item_delete_by_id ( id0: i32, conn: &SqliteConnection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::items::dsl::*;
    diesel::delete(items.filter(id.eq(id0))).execute(conn)
}

pub fn item_delete_by_uuid ( uuid0: Uuid, conn: &SqliteConnection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::items::dsl::*;
    diesel::delete(items.filter(uuid.eq(uuid0.as_bytes().as_ref()))).execute(conn)
}

pub fn item_update_by_id( 
        data: &models::ItemPost, id0: i32, conn: &SqliteConnection 
    ) -> Result<usize, diesel::result::Error> {

    use crate::schema::items::dsl::*;

    diesel::update(items.filter(id.eq(id0))).set(data).execute(conn)
}

pub fn item_update_by_uuid( 
        data: &models::ItemPost, uuid0: Uuid, conn: &SqliteConnection 
    ) -> Result<usize, diesel::result::Error> {

    use crate::schema::items::dsl::*;

    diesel::update(items.filter(uuid.eq(uuid0.as_bytes().as_ref()))).set(data).execute(conn)
}

pub fn item_update_name_by_id ( name0: &str, id0: i32, conn: &SqliteConnection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::items::dsl::*;
    diesel::update(items.filter(id.eq(id0))).set(name.eq(name0)).execute(conn)
}

pub fn item_update_description_by_id ( description0: Option<&str>, id0: i32, conn: &SqliteConnection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::items::dsl::*;
    diesel::update(items.filter(id.eq(id0))).set(description.eq(description0)).execute(conn)
}

pub async fn item_create_json(
     data : web::Json<models::ItemPost>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let uuid = web::block(move || item_create(&data, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    Ok(HttpResponse::Ok().json(uuid))
}

pub async fn items_all_json(
   pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let items = web::block(move || items_all(&conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
    
    Ok(HttpResponse::Ok().json(items))
}

pub async fn item_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let loc = web::block(move || item_by_id(*path, &conn))
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

pub async fn item_name_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let loc = web::block(move || item_by_id(*path, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
    if let Some(loc) = loc {
        Ok(HttpResponse::Ok().json(loc.name))
    }else {
        Ok(HttpResponse::NotFound().finish())
    }
}

pub async fn item_description_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let loc = web::block(move || item_by_id(*path, &conn))
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

pub async fn item_delete_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || item_delete_by_id(*path, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    Ok(HttpResponse::NoContent().finish())
}

pub async fn item_update_by_id_json(
     path: web::Path<i32>
   , data : web::Json<models::ItemPost>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    let id = *path;
    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || item_update_by_id(&data,id, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    item_by_id_json(path,pool).await
}

pub async fn item_update_name_by_id_json(
     path: web::Path<i32>
   , data: web::Json<String>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    let id = *path;
    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || item_update_name_by_id(&data, id, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    item_name_by_id_json(path,pool).await
}

pub async fn item_update_description_by_id_json(
     path: web::Path<i32>
   , data: web::Json<Option<String>>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    let id = *path;
    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || item_update_description_by_id(data.as_deref(), id, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    item_description_by_id_json(path,pool).await
}

pub async fn item_clear_description_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    let id = *path;
    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || item_update_description_by_id(None, id, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    item_description_by_id_json(path,pool).await
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
      .service(web::resource("/items")
          .route(web::get().to(items_all_json))
          .route(web::post().to(item_create_json))
        )
      .service(web::resource("/items/{id}")
          .route(web::get().to(item_by_id_json))
          .route(web::post().to(item_update_by_id_json))
        )
      .service(web::resource("/items/{id}/name")
          .route(web::get().to(item_name_by_id_json))
          .route(web::post().to(item_update_name_by_id_json))
        )
      .service(web::resource("/items/{id}/description")
          .route(web::get().to(item_description_by_id_json))
          .route(web::post().to(item_update_description_by_id_json))
          .route(web::delete().to(item_clear_description_by_id_json))
        );
}

