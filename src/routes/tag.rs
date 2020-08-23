
use crate::db::DbPool;
use crate::actions::tag::*;
use crate::models;

use actix_web::{web,HttpResponse};


pub async fn tag_create_json(
     data : web::Json<models::TagPost>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let uuid = web::block(move || tag_create(&data, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    Ok(HttpResponse::Ok().json(uuid))
}

pub async fn tags_all_json(
   pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let tags = web::block(move || tags_all(&conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
    
    Ok(HttpResponse::Ok().json(tags))
}

pub async fn tag_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let loc = web::block(move || tag_by_id(*path, &conn))
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

pub async fn tag_by_name_json(
     path: web::Path<String>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let loc = web::block(move || tag_by_name(&path, &conn))
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


