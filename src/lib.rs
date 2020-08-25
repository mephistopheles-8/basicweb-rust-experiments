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
      .service( 
          web::scope("/api/v1/")
            .service(web::resource("/galleries")
                .route(web::get().to(routes::user_gallery::user_galleries_by_login_json))
                .route(web::post().to(routes::user_gallery::user_gallery_create_json))
            )
            .service(web::resource("/galleries/{uuid}")
                .route(web::get().to(routes::user_gallery::user_gallery_by_uuid_json))
            )
            .service(web::resource("/galleries/items/{uuid}")
                .route(web::get().to(routes::user_gallery_item::user_gallery_item_by_uuid_json))
            )
            .service(web::resource("/galleries/items/{uuid}/tags")
                .route(web::get().to(routes::gallery_item_tag::gallery_item_tags_json))
                .route(web::post().to(routes::gallery_item_tag::gallery_item_tags_create_json))
            )
            .service(web::resource("/galleries/{uuid}/items")
                .route(web::get().to(routes::user_gallery_item::user_gallery_items_by_gallery_uuid_json))
                .route(web::post().to(routes::user_gallery_item::user_gallery_item_multipart_image))
            )
            .service(web::resource("/galleries/{uuid}/tags")
                .route(web::get().to(routes::gallery_tag::gallery_tags_json))
                .route(web::post().to(routes::gallery_tag::gallery_tags_create_json))
            )
          .service(web::resource("/{handle}/galleries/{url}")
              .route(web::get().to(routes::user_gallery::user_gallery_by_url_json))
          )
          .service(web::resource("/{handle}/galleries/{url}/items")
              .route(web::get().to(routes::user_gallery_item::user_gallery_items_by_url_json))
          )
          .service(web::resource("/{handle}/galleries/{galleryUrl}/items/{itemUrl}")
              .route(web::get().to(routes::user_gallery_item::user_gallery_item_by_url_json))
          )
      )
      .service(web::resource("/galleries/create")
          .route(web::get().to(routes::user_gallery::user_gallery_create_form))
      )
      .service(web::resource("/{handle}/galleries/{galleryUrl}/items/{itemUrl}")
          .route(web::get().to(routes::user_gallery_item::user_gallery_item_serve_by_url))
      )
      .service(web::resource("/").route(web::get().to(index)))
      ;
}

