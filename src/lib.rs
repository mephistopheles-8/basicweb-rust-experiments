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

use routes::{user,post};

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
    user::users_api(cfg);
    post::api_html(cfg);
    cfg
      .service(web::resource("/").route(web::get().to(index)))
      .service(
          web::scope("/api/v1")
            .configure(user::users_api_json)      
            .configure(post::api_v1_json) 
          );
}

