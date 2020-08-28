#[macro_use]
extern crate diesel;

#[macro_use]
extern crate serde_json;

pub mod util;
pub mod schema;
pub mod models;
pub mod actions;
pub mod routes;
pub mod db;

pub use routes::user::{users_api_json,users_api};

use handlebars::Handlebars;
use actix_web::{web,HttpResponse};

pub async fn index(hb: web::Data<Handlebars<'_>>) -> HttpResponse {
    let data = json!({
        "title": "Welcome"
      , "parent" : "main"
    });
    let body = hb.render("content/index", &data).unwrap();

    HttpResponse::Ok().body(body)
}

pub fn min_api( cfg: &mut web::ServiceConfig ) {
    users_api(cfg);
    cfg
      .service(web::resource("/").route(web::get().to(index)))
      .service(
          web::scope("/api/v1")
            .configure(users_api_json)      
          );
}

