#[macro_use]
extern crate diesel;
#[macro_use]
extern crate serde_json;

pub mod db;
pub mod schema;
pub mod models;
pub mod util;
pub mod actions;
pub mod routes;

use handlebars::Handlebars;
use actix_web::{web,HttpResponse};
use actix_identity::Identity;
use db::DbPool;


pub async fn index(id: Identity, hb: web::Data<Handlebars<'_>>) -> HttpResponse {
    let data = json!({
        "title": "Welcome"
      , "parent" : "main"
      , "logged_in": id.identity().is_some()
    });
    let body = hb.render("content/index", &data).unwrap();

    HttpResponse::Ok().body(body)
}

pub async fn profile(
    id: Identity,
    path: web::Path<String>,
    hb: web::Data<Handlebars<'_>>,
    pool: web::Data<DbPool>,
) -> Result<HttpResponse, actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let user = web::block(move || {
        actions::user::user_by_handle(&path,&conn)
    }).await
      .map_err(|e| {
        eprintln!("{}", e);
        HttpResponse::InternalServerError().finish()
      })?;
   
    if let Some(user) = user {
        let data = json!({
            "title": "Welcome"
          , "parent" : "main"
          , "logged_in": id.identity().is_some()
          , "handle" : serde_json::ser::to_string(&user.handle)?
        });
        let body = hb.render("content/profile", &data).unwrap();

        Ok(HttpResponse::Ok().body(body))
    }else{
        Ok(HttpResponse::NotFound().finish())
    }
}

pub fn min_api( cfg: &mut web::ServiceConfig ) {
    routes::user::users_api(cfg);
    cfg
      .service( 
          web::scope("/api/v1/")
            .service(web::resource("/public/tags")
               .route(web::get().to(routes::tag::tags_all_json))
            )
            .service(web::resource("/public/posts/by-tag/{tag}")
              .route(web::get().to(routes::user_post::user_posts_public_by_tag_json))
            )
            .service(web::resource("/public/galleries/by-tag/{tag}")
              .route(web::get().to(routes::user_gallery::user_galleries_public_by_tag_json))
            )
            .service(web::resource("/public/galleries/items/by-tag/{tag}")
              .route(web::get().to(routes::user_gallery_item::user_gallery_items_public_by_tag_json))
            )
            .service(web::resource("/public/user/exists/{url}")
                .route(web::get().to(routes::user::user_handle_exists_json))
            )
            .service(web::resource("/galleries")
                .route(web::get().to(routes::user_gallery::user_galleries_by_login_json))
                .route(web::post().to(routes::user_gallery::user_gallery_create_json))
            )
            .service(web::resource("/galleries/reorder")
                .route(web::post().to(routes::user_gallery::user_gallery_ord_json))
            )
            .service(web::resource("/galleries/exists/{url}")
                .route(web::get().to(routes::user_gallery::user_gallery_url_exists_by_login_json))
            )
            .service(web::resource("/galleries/by-tag/{tag}")
                .route(web::get().to(routes::user_gallery::user_galleries_all_by_tag_login_json))
            )
            .service(web::resource("/galleries/{uuid}")
                .route(web::get().to(routes::user_gallery::user_gallery_by_uuid_json))
                .route(web::post().to(routes::user_gallery::user_gallery_update_by_uuid_json))
                .route(web::delete().to(routes::user_gallery::user_gallery_delete_by_uuid_json))
            )
            .service(web::resource("/galleries/items/reorder")
                .route(web::post().to(routes::user_gallery_item::user_gallery_item_ord_json))
            )
            .service(web::resource("/galleries/items/exists/{url}")
                .route(web::get().to(routes::user_gallery_item::user_gallery_item_url_exists_by_login_json))
            )
            .service(web::resource("/galleries/items/by-tag/{tag}")
                .route(web::get().to(routes::user_gallery_item::user_gallery_items_all_by_tag_login_json))
            )
            .service(web::resource("/galleries/items/{uuid}")
                .route(web::get().to(routes::user_gallery_item::user_gallery_item_by_uuid_json))
                .route(web::post().to(routes::user_gallery_item::user_gallery_item_update_by_uuid_json))
                .route(web::delete().to(routes::user_gallery_item::user_gallery_item_delete_by_uuid_json))
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
          .service(web::resource("/u/{handle}/galleries")
              .route(web::get().to(routes::user_gallery::user_galleries_by_url_json))
          )
          .service(web::resource("/u/{handle}/galleries/by-tag/{tag}")
              .route(web::get().to(routes::user_gallery::user_galleries_public_by_handle_tag_json))
          )
          .service(web::resource("/u/{handle}/galleries/items/by-tag/{tag}")
              .route(web::get().to(routes::user_gallery_item::user_gallery_items_public_by_handle_tag_json))
          )
          .service(web::resource("/u/{handle}/galleries/{url}")
              .route(web::get().to(routes::user_gallery::user_gallery_by_url_json))
          )
          .service(web::resource("/u/{handle}/galleries/{url}/items")
              .route(web::get().to(routes::user_gallery_item::user_gallery_items_by_url_json))
          )
          .service(web::resource("/u/{handle}/galleries/{galleryUrl}/items/{itemUrl}")
              .route(web::get().to(routes::user_gallery_item::user_gallery_item_by_url_json))
          )
          .service(web::resource("/u/{handle}/posts")
              .route(web::get().to(routes::user_post::user_posts_by_url_json))
          )
          .service(web::resource("/u/{handle}/posts/by-tag/{tag}")
              .route(web::get().to(routes::user_post::user_posts_public_by_handle_tag_json))
          )
          .service(web::resource("/u/{handle}/posts/{url}")
              .route(web::get().to(routes::user_post::user_post_by_url_json))
          )
          .service(web::resource("/posts")
                .route(web::get().to(routes::user_post::user_posts_by_login_json))
                .route(web::post().to(routes::user_post::user_post_create_json))
          )
          .service(web::resource("/posts/reorder")
               .route(web::post().to(routes::user_post::user_post_ord_json))
          )
          .service(web::resource("/posts/exists/{url}")
               .route(web::get().to(routes::user_post::user_post_url_exists_by_login_json))
          )
          .service(web::resource("/posts/by-tag/{tag}")
                .route(web::get().to(routes::user_post::user_posts_all_by_tag_login_json))
            )
          .service(web::resource("/posts/{uuid}")
                .route(web::get().to(routes::user_post::user_post_by_uuid_auth_json))
                .route(web::post().to(routes::user_post::user_post_update_json))
                .route(web::delete().to(routes::user_post::user_post_delete_by_uuid_json))
          )
          .service(web::resource("/posts/{uuid}/tags")
                .route(web::get().to(routes::post_tag::post_tags_json))
                .route(web::post().to(routes::post_tag::post_tags_create_json))
            )
      )
      .service(web::resource("/user/galleries")
          .route(web::get().to(routes::user_gallery::user_galleries_by_login_dynamic_html))
      )
      .service(web::resource("/user/galleries/create")
          .route(web::get().to(routes::user_gallery::user_gallery_create_form))
      )
      .service(web::resource("/user/galleries/{uuid}")
          .route(web::get().to(routes::user_gallery::user_gallery_by_login_html))
      )
      .service(web::resource("/user/assets/{uuid}")
          .route(web::get().to(routes::user_gallery_item::user_gallery_item_serve_by_login))
      )
      .service(web::resource("/user/posts")
          .route(web::get().to(routes::user_post::user_posts_by_login_dynamic_html))
      )
      .service(web::resource("/user/posts/create")
          .route(web::get().to(routes::user_post::user_post_create_form))
      )
      .service(web::resource("/user/posts/{uuid}")
          .route(web::get().to(routes::user_post::user_post_update_form))
      )
      .service(web::resource("/u/{handle}")
          .route(web::get().to(profile))
      )
      .service(web::resource("/u/{handle}/galleries/{galleryUrl}/items/{itemUrl}")
          .route(web::get().to(routes::user_gallery_item::user_gallery_item_serve_by_url))
      )
      .service(web::resource("/").route(web::get().to(index)))
      ;
}

