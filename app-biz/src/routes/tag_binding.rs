
use crate::db::DbPool;
use crate::actions::tag_binding::*;

use actix_web::{web,HttpResponse};


pub async fn tag_binding_create_json(
     data : web::Json<(i32,i32,i32)>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");
    let data = *data;
    // use web::block to offload blocking Diesel code without blocking server thread
    let uuid = web::block(move || tag_binding_create(data.0, data.1, data.2, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    Ok(HttpResponse::Ok().json(uuid))
}

pub async fn tag_binding_delete_by_tag_json(
     data : web::Json<(i32,i32,i32)>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");
    let data = *data;
    // use web::block to offload blocking Diesel code without blocking server thread
    let uuid = web::block(move || tag_binding_delete_by_tag(data.0, data.1, data.2, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    Ok(HttpResponse::Ok().json(uuid))
}

pub async fn tag_binding_delete_by_id_json(
     data : web::Json<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");
    let id = *data;
    // use web::block to offload blocking Diesel code without blocking server thread
    let uuid = web::block(move || tag_binding_delete_by_id(id, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    Ok(HttpResponse::Ok().json(uuid))
}

