
pub mod item;
pub mod user;
pub mod gallery;
pub mod gallery_item;
pub mod resource;
pub mod post;
pub mod tag;
pub mod tag_binding;
pub mod user_gallery;
pub mod user_gallery_item;
pub mod gallery_tag;
pub mod gallery_item_tag;
pub mod post_tag;
pub mod user_post;
pub mod user_gallery_post;
pub mod user_tag;

pub mod gallery_apis {
    use actix_web::web;
    use crate::routes::gallery::*;
    use crate::routes::gallery_item::*;
    pub fn gallery_api_read( cfg: &mut web::ServiceConfig ) {
        cfg
        .service(web::resource("/galleries")
            .route(web::get().to(gallery_listing_json))
        )
        .service(web::resource("/galleries/{id}")
            .route(web::get().to(gallery_by_uuid_json))
        )
        .service(web::resource("/galleries/{id}/items")
            .route(web::get().to(gallery_items_json))
        )
        .service(web::resource("/galleries/{id}/item-create")
            .route(web::get().to(gallery_item_form))
         )
        .service(web::resource("/galleries/{gallery}/items/{id}")
            .route(web::get().to(gallery_item_json))
        );
    }

    pub fn gallery_api_write( cfg: &mut web::ServiceConfig ) {
        cfg
        .service(web::resource("/galleries")
            .route(web::post().to(gallery_create_json))
        )
        .service(web::resource("/galleries/{id}/items")
            .route(web::post().to(gallery_item_multipart_image))
        );
    }


    pub fn gallery_api( cfg: &mut web::ServiceConfig ) {
        cfg
        .service(web::resource("/assets/{id}")
            .route(web::get().to(gallery_item_serve))
        )
        .service(web::resource("/galleries/create")
            .route(web::get().to(gallery_create_form))
        )
        .service(web::resource("/galleries/show")
            .route(web::get().to(gallery_listing_html))
        )
        .service(web::resource("/galleries/show/{id}")
            .route(web::get().to(gallery_html))
        )
        .service(web::resource("/galleries")
            .route(web::get().to(gallery_listing_json))
            .route(web::post().to(gallery_create_json))
        )
        .service(web::resource("/galleries/{id}")
            .route(web::get().to(gallery_by_uuid_json))
            .route(web::post().to(gallery_update_by_uuid_json))
        )
        .service(web::resource("/galleries/{id}/items")
            .route(web::get().to(gallery_items_json))
            .route(web::post().to(gallery_item_multipart_image))
        )
        .service(web::resource("/galleries/{id}/item-create")
            .route(web::get().to(gallery_item_form))
         )
        .service(web::resource("/galleries/{gallery}/items/{id}")
            .route(web::get().to(gallery_item_json))
        );
    }
}
