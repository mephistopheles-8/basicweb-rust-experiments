#[macro_use]
extern crate diesel;
#[macro_use]
extern crate serde_json;

use handlebars::Handlebars;
use actix_web::{web,HttpResponse};
use actix_identity::Identity;

pub mod db;
pub mod schema;
pub mod models;
pub mod util;
pub mod actions;
pub mod routes;

pub async fn index(id: Identity, hb: web::Data<Handlebars<'_>>) -> HttpResponse {
    let data = json!({
        "title": "Welcome"
      , "parent" : "main"
      , "logged_in": id.identity().is_some()
    });
    let body = hb.render("content/index", &data).unwrap();

    HttpResponse::Ok().body(body)
}

pub fn min_api( cfg: &mut web::ServiceConfig ) {
    routes::user::users_api(cfg);
    cfg
      .service(web::resource("/").route(web::get().to(index)));
}

