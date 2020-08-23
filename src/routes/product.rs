
use crate::db::DbPool;
use crate::actions::product::*;
use crate::models;

use actix_web::{web,HttpResponse};


pub async fn product_create_json(
     path : web::Path<i32>
   , data : web::Json<models::ProductPostNew>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");
    let catalog_id = *path;
    // use web::block to offload blocking Diesel code without blocking server thread
    let uuid = web::block(move || product_create(catalog_id, &data, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    Ok(HttpResponse::Ok().json(uuid))
}

pub async fn products_all_json(
   pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let products = web::block(move || products_all(&conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
    
    Ok(HttpResponse::Ok().json(products))
}

pub async fn product_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let loc = web::block(move || product_by_id(*path, &conn))
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

pub async fn product_name_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let loc = web::block(move || product_by_id(*path, &conn))
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

pub async fn product_description_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let loc = web::block(move || product_by_id(*path, &conn))
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

pub async fn product_delete_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || product_delete_by_id(*path, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    Ok(HttpResponse::NoContent().finish())
}

pub async fn product_update_by_id_json(
     path: web::Path<i32>
   , data : web::Json<models::ProductPostUpdate>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    let id = *path;
    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || product_update_by_id(&data,id, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    product_by_id_json(path,pool).await
}

pub async fn product_update_name_by_id_json(
     path: web::Path<i32>
   , data: web::Json<String>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    let id = *path;
    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || product_update_name_by_id(&data, id, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    product_name_by_id_json(path,pool).await
}

pub async fn product_update_description_by_id_json(
     path: web::Path<i32>
   , data: web::Json<Option<String>>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    let id = *path;
    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || product_update_description_by_id(data.as_deref(), id, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    product_description_by_id_json(path,pool).await
}

pub async fn product_clear_description_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    let id = *path;
    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || product_update_description_by_id(None, id, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    product_description_by_id_json(path,pool).await
}
