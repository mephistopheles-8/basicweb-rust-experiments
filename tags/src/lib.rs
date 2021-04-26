#[macro_use]
extern crate diesel;
#[macro_use]
extern crate serde_json;

use handlebars::Handlebars;
use actix_web::{web,HttpResponse};

pub mod db;
pub mod schema;
pub mod models;
pub mod util;
pub mod actions;
pub mod routes;

pub async fn index(hb: web::Data<Handlebars<'_>>) -> HttpResponse {
    let data = json!({
        "title": "Welcome"
      , "parent" : "main"
    });
    let body = hb.render("content/index", &data).unwrap();

    HttpResponse::Ok().body(body)
}

pub fn min_api( cfg: &mut web::ServiceConfig ) {
    routes::tag::tags_api(cfg);
    cfg
      .service(web::resource("/").route(web::get().to(index)))
      /*
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
        )*/;
}

