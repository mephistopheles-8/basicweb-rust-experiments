#[macro_use]
extern crate diesel;
#[macro_use]
extern crate serde_json;

use handlebars::Handlebars;
use actix_web::{web,HttpResponse};
use actix_multipart::Multipart;
use async_std::prelude::*;
use futures::{StreamExt, TryStreamExt};
use diesel::prelude::*;
use diesel::r2d2::{self, ConnectionManager};
use uuid::Uuid;
use serde::{Serialize,Deserialize};

pub mod schema;
pub mod models;

pub type DbPool = r2d2::Pool<ConnectionManager<SqliteConnection>>;


pub fn galleries_all ( conn: &SqliteConnection ) 
    -> Result<Vec<models::Gallery>, diesel::result::Error> {

    use crate::schema::galleries::dsl::*;
    let g0s = galleries.load( conn )?; 
    Ok(g0s)
}

pub fn gallery_by_id ( id0: i32, conn: &SqliteConnection ) 
    -> Result<Option<models::Gallery>, diesel::result::Error> {

    use crate::schema::galleries::dsl::*;
    let g0s = galleries
             .filter(id.eq(id0))
             .first::<models::Gallery>( conn )
             .optional()?; 
    Ok(g0s)
}

pub fn gallery_by_uuid ( uuid0: Uuid, conn: &SqliteConnection ) 
    -> Result<Option<models::Gallery>, diesel::result::Error> {

    use crate::schema::galleries::dsl::*;
    let g0s = galleries
              .filter(uuid.eq(uuid0.as_bytes().as_ref()))
              .first::<models::Gallery>( conn )
              .optional()?; 
    Ok(g0s)
}

pub fn gallery_items_by_gallery ( gallery_id: i32, conn: &SqliteConnection ) 
    -> Result<Vec<(models::GalleryItem, models::Resource)>, diesel::result::Error> {

    use crate::schema::gallery_items::dsl::*;
    use crate::schema::resources::dsl::*;

    let g0s = gallery_items
              .filter(gallery.eq(gallery_id))
              .inner_join(resources)
              .load( conn )?; 
    Ok(g0s)
}


pub fn gallery_item_by_id ( id0: i32, conn: &SqliteConnection ) 
    -> Result<Option<(models::GalleryItem, models::Resource)>, diesel::result::Error> {

    use crate::schema::gallery_items::dsl::*;
    use crate::schema::resources::dsl::resources;

    let g0s = gallery_items
                .filter(id.eq(id0))
                .inner_join(resources)
                .first( conn )
                .optional()?; 
    Ok(g0s)
}

pub fn gallery_item_by_id0 ( id0: i32, gallery0: i32, conn: &SqliteConnection ) 
    -> Result<Option<(models::GalleryItem, models::Resource)>, diesel::result::Error> {

    use crate::schema::gallery_items::dsl::*;
    use crate::schema::resources::dsl::resources;

    let g0s = gallery_items
                .filter(id.eq(id0).and(gallery.eq(gallery0)))
                .inner_join(resources)
                .first( conn )
                .optional()?; 
    Ok(g0s)
}

pub fn gallery_item_by_uuid ( uuid0: Uuid, conn: &SqliteConnection ) 
    -> Result<Option<(models::GalleryItem, models::Resource)>, diesel::result::Error> {

    use crate::schema::gallery_items::dsl::*;
    use crate::schema::resources::dsl::resources;

    let g0s = gallery_items
                .filter(uuid.eq(uuid0.as_bytes().as_ref()))
                .inner_join(resources)
                .first( conn )
                .optional()?; 
    Ok(g0s)
}

pub fn gallery_create(
      name0 : &str
    , description0: &str
    , kind0: i32
    , conn: &SqliteConnection 
  ) -> Result<Uuid, diesel::result::Error> {
    use crate::schema::galleries::dsl::*;

    let uuid0 = Uuid::new_v4();

    let new_gallery = models::NewGallery {
        kind: kind0
     ,  name: name0
     ,  description: description0
     ,  uuid : uuid0.as_bytes()
    };

    diesel::insert_into(galleries).values(&new_gallery).execute(conn)?;
    Ok(uuid0)
}

pub fn gallery_item_create( 
      name0 : &str
    , description0: &str
    , kind0: i32
    , gallery0: i32
    , resource0 : i32 
    , conn: &SqliteConnection 
  ) -> Result<Uuid, diesel::result::Error> {

   use crate::schema::gallery_items::dsl::*;

   let uuid0 = Uuid::new_v4();

   let new_gallery_item = 
       models::NewGalleryItem {
         gallery: gallery0,
         resource: resource0,
         kind: kind0,
         name: name0,
         description: description0,
         uuid: uuid0.as_bytes(),
      };

    diesel::insert_into(gallery_items).values(&new_gallery_item).execute(conn)?;

    Ok(uuid0)
}

fn resource_create ( 
      filepath0: &str
    , kind0: i32
    , conn: &SqliteConnection 
  ) -> Result<Uuid, diesel::result::Error> {

   use crate::schema::resources::dsl::*;

   let uuid0 = Uuid::new_v4();

   let new_resource = models::NewResource {
        filepath : filepath0
      , kind : kind0
      , uuid : uuid0.as_bytes()
   };

    diesel::insert_into(resources).values(&new_resource).execute(conn)?;

    Ok(uuid0)
}

pub fn gallery_item_resource_create( 
      name0 : &str
    , description0: &str
    , kinds: (i32,i32)
    , filepath0 : &str 
    , gallery0: i32
    , conn: &SqliteConnection 
  ) -> Result<(Uuid,Uuid), diesel::result::Error> {

   use crate::schema::resources::dsl::*;

   conn.transaction(|| {
        let res_uuid = resource_create(filepath0,kinds.0,conn)?;
    
        let res = resources
                  .filter(uuid.eq(res_uuid.as_bytes().as_ref()))
                  .first::<models::Resource>(conn)?; 
        
        let gi_uuid = gallery_item_create(name0,description0,kinds.1,gallery0, res.id, conn)?;

        Ok((res_uuid, gi_uuid))
    })
}


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

#[derive(Serialize,Deserialize)]
pub struct GalleryPost {
    pub name : String,
    pub description : String,
    pub kind : i32,
}

pub async fn gallery_create_json(
   data: web::Json<GalleryPost>, 
   pool: web::Data<DbPool>
 ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let uuid = web::block(move || gallery_create(&data.name, &data.description, data.kind, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    Ok(HttpResponse::Ok().json(uuid))
 }

pub async fn gallery_json(
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

pub async fn gallery_items_json(
    path: web::Path<i32>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let items = web::block(move || {
        let gallery = gallery_by_id(*path,&conn)?;
        if gallery.is_some() {
           let items =  gallery_items_by_gallery(*path,&conn)?;
           Ok::<_,diesel::result::Error>(Some(items))
        }else{
           Ok::<_,diesel::result::Error>(None)
        }
    }).await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
   
    if let Some(items) = items {
        Ok(HttpResponse::Ok().json(items))
    }else {
        Ok(HttpResponse::NotFound().finish())
    }
}

#[derive(Serialize,Deserialize)]
pub struct GalleryItemPost {
    pub name : String,
    pub description : String,
    pub kind : i32,
}

// first field is GalleryItemPost json
// next field is the resource file

pub async fn gallery_item_multipart(
    mut payload: Multipart
  , path: web::Path<i32>
  , pool: web::Data<DbPool>
) -> Result<HttpResponse, actix_web::Error> {

   let conn = pool.get().expect("couldn't get db connection from pool");

   let mut buf = vec![];
   // NOTE: the outstanding mutable reference makes this
   // hang.  You need to process fields in individual blocks.
   // (eg, cannot call payload.try_next().await within this block)
   if let Ok(Some(mut field)) = payload.try_next().await {
        let content_type = field
            .content_disposition()
            .ok_or_else(|| actix_web::error::ParseError::Incomplete)?;

        println!("name: {}", content_type.get_name().unwrap());

        while let Some(chunk) = field.next().await {
            let data = chunk.unwrap();
            buf.push(data);
        }
   }

   let item : GalleryItemPost 
        = serde_json::from_slice(buf.concat().as_slice())
            .map_err(|_| actix_web::error::ParseError::Incomplete)?;

   if let Ok(Some(mut field)) = payload.try_next().await {
        let content_type = field
            .content_disposition()
            .ok_or_else(|| actix_web::error::ParseError::Incomplete)?;
        let filename = content_type
            .get_filename()
            .ok_or_else(|| actix_web::error::ParseError::Incomplete)?;
        let filepath = format!("./tmp/{}", sanitize_filename::sanitize(&filename));
        let mut f = async_std::fs::File::create(&filepath).await?;

        // Field in turn is stream of *Bytes* object
        while let Some(chunk) = field.next().await {
            let data = chunk.unwrap();
            f.write_all(&data).await?;
        }

        // use web::block to offload blocking Diesel code without blocking server thread
        let _uuid = web::block(move || 
            gallery_item_resource_create(&item.name, &item.description, (item.kind,0), &filepath, *path, &conn))
            .await
            .map_err(|e| {
                eprintln!("{}", e);
                HttpResponse::InternalServerError().finish()
            })?;
   }
        
   Ok(HttpResponse::Ok().into())
}



pub async fn gallery_item_json(
    path: web::Path<(i32,i32)>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let item = web::block(move || gallery_item_by_id0(path.1,path.0,&conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    if let Some(item) = item {    
        Ok(HttpResponse::Ok().json(item))
    }else{
        Ok(HttpResponse::NotFound().finish())
    }
}

pub async fn gallery_item_form(
    path: web::Path<i32>,
    hb: web::Data<Handlebars<'_>>
    ) -> HttpResponse {
    let data = json!({
        "title": "Add New Gallery Item"
      , "parent" : "main"
      , "action": format!("/galleries/{}/items", *path)
    });
    let body = hb.render("content/gallery-item-create", &data).unwrap();

    HttpResponse::Ok().body(body)
}

pub fn gallery_api_read( cfg: &mut web::ServiceConfig ) {
    cfg
    .service(web::resource("/galleries")
        .route(web::get().to(gallery_listing_json))
    )
    .service(web::resource("/galleries/{id}")
        .route(web::get().to(gallery_json))
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
        .route(web::post().to(gallery_item_multipart))
    );
}


pub fn gallery_api( cfg: &mut web::ServiceConfig ) {
    cfg
    .service(web::resource("/galleries")
        .route(web::get().to(gallery_listing_json))
        .route(web::post().to(gallery_create_json))
    )
    .service(web::resource("/galleries/{id}")
        .route(web::get().to(gallery_json))
    )
    .service(web::resource("/galleries/{id}/items")
        .route(web::get().to(gallery_items_json))
        .route(web::post().to(gallery_item_multipart))
    )
    .service(web::resource("/galleries/{id}/item-create")
        .route(web::get().to(gallery_item_form))
     )
    .service(web::resource("/galleries/{gallery}/items/{id}")
        .route(web::get().to(gallery_item_json))
    );
}


