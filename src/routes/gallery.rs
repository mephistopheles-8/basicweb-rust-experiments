
use handlebars::Handlebars;
use actix_web::{web,HttpResponse};
use crate::actions::gallery::*;
use crate::models;
use crate::db::DbPool;
use uuid::Uuid;

pub async fn gallery_listing_json(
   pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let galleries = web::block(move || galleries_all(&conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
    
    Ok(HttpResponse::Ok().json(galleries))
}

pub async fn gallery_create_json(
   data: web::Json<models::GalleryPost>, 
   pool: web::Data<DbPool>
 ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let uuid = web::block(move || gallery_create(&data, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    Ok(HttpResponse::Ok().json(uuid))
 }

pub async fn gallery_by_id_json(
    path: web::Path<i32>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let gallery = web::block(move || gallery_by_id(*path,&conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
 
    if let Some(gallery) = gallery {
        Ok(HttpResponse::Ok().json(gallery))
    }else {
        Ok(HttpResponse::NotFound().finish())
    }
}

pub async fn gallery_by_uuid_json(
    path: web::Path<Uuid>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let gallery = web::block(move || gallery_by_uuid(*path,&conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
 
    if let Some(gallery) = gallery {
        Ok(HttpResponse::Ok().json(gallery))
    }else {
        Ok(HttpResponse::NotFound().finish())
    }
}

pub async fn gallery_update_by_id_json(
    path: web::Path<i32>
  , data: web::Json<models::GalleryPost>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let gallery = web::block(move || {
        let _ = gallery_update_by_id(*path,&data,&conn)?;
        gallery_by_id(*path, &conn)
    }).await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
 
    if let Some(gallery) = gallery {
        Ok(HttpResponse::Ok().json(gallery))
    }else {
        Ok(HttpResponse::NotFound().finish())
    }
}

pub async fn gallery_update_by_uuid_json(
    path: web::Path<Uuid>
  , data: web::Json<models::GalleryPost>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let gallery = web::block(move || {
        let _ = gallery_update_by_uuid(*path,&data,&conn)?;
        gallery_by_uuid(*path, &conn)
    }).await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
 
    if let Some(gallery) = gallery {
        Ok(HttpResponse::Ok().json(gallery))
    }else {
        Ok(HttpResponse::NotFound().finish())
    }
}

pub async fn gallery_create_form(
    hb: web::Data<Handlebars<'_>>
    ) -> HttpResponse {
    let data = json!({
        "title": "Add New Gallery"
      , "parent" : "main"
    });
    let body = hb.render("content/gallery-create-dynamic", &data).unwrap();

    HttpResponse::Ok().body(body)
}

