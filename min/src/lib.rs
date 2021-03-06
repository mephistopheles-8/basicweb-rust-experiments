
#[macro_use]
extern crate serde_json;

use handlebars::Handlebars;
use actix_web::{web,HttpResponse};

pub mod util;

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
      .service(web::resource("/").route(web::get().to(index)));
}

