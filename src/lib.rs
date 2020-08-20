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
use std::path::Path;
use bytes::{BytesMut,BufMut};
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

pub fn gallery_items_by_gallery_id ( gallery_id: i32, conn: &SqliteConnection ) 
    -> Result<Vec<(models::GalleryItem, models::Resource)>, diesel::result::Error> {

    use crate::schema::gallery_items::dsl::*;
    use crate::schema::resources::dsl::*;

    let g0s = gallery_items
              .filter(gallery.eq(gallery_id))
              .inner_join(resources)
              .load( conn )?; 
    Ok(g0s)
}

pub fn gallery_items_by_gallery_uuid ( gallery_uuid: Uuid, conn: &SqliteConnection ) 
    -> Result<Vec<(models::GalleryItem, models::Resource)>, diesel::result::Error> {

    use crate::schema::*;

    let g0s = gallery_items::table
              .filter(
                  galleries::uuid.eq(gallery_uuid.as_bytes().as_ref())
                  .and(gallery_items::gallery.eq(galleries::id))
              )
              .inner_join(galleries::table)
              .inner_join(resources::table)
              .select((gallery_items::all_columns, resources::all_columns))
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

pub fn gallery_item_by_uuid0 ( uuid0: Uuid, gallery_uuid: Uuid, conn: &SqliteConnection ) 
    -> Result<Option<(models::GalleryItem, models::Resource)>, diesel::result::Error> {

    use crate::schema::*;
    
    let g0s = gallery_items::table
              .filter(
                  galleries::uuid.eq(gallery_uuid.as_bytes().as_ref())
                  .and(gallery_items::gallery.eq(galleries::id))
                  .and(gallery_items::uuid.eq(uuid0.as_bytes().as_ref()))
              )
              .inner_join(galleries::table)
              .inner_join(resources::table)
              .select((gallery_items::all_columns, resources::all_columns))
              .first( conn )
              .optional()?; 
    Ok(g0s)
}

pub fn gallery_create(
      data : &models::GalleryPost
    , conn: &SqliteConnection 
  ) -> Result<Uuid, diesel::result::Error> {
    use crate::schema::galleries::dsl::*;

    let uuid0 = Uuid::new_v4();

    let new_gallery = models::NewGallery {
        kind: data.kind
     ,  name: &data.name
     ,  description: &data.description
     ,  uuid : uuid0.as_bytes()
    };

    diesel::insert_into(galleries).values(&new_gallery).execute(conn)?;
    Ok(uuid0)
}

pub fn gallery_update_by_id(
      id0 : i32
    , data : &models::GalleryPost
    , conn: &SqliteConnection 
  ) -> Result<usize, diesel::result::Error> {
    use crate::schema::galleries::dsl::*;

    diesel::update(galleries.filter(id.eq(id0))).set(data).execute(conn)
}

pub fn gallery_update_by_uuid(
      uuid0 : Uuid
    , data : &models::GalleryPost
    , conn: &SqliteConnection 
  ) -> Result<usize, diesel::result::Error> {
    use crate::schema::galleries::dsl::*;

    diesel::update(galleries.filter(uuid.eq(uuid0.as_bytes().as_ref()))).set(data).execute(conn)
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
    , mime0: &str
    , kind0: i32
    , conn: &SqliteConnection 
  ) -> Result<Uuid, diesel::result::Error> {

   use crate::schema::resources::dsl::*;

   let uuid0 = Uuid::new_v4();

   let new_resource = models::NewResource {
        filepath : filepath0
      , kind : kind0
      , mime : mime0
      , uuid : uuid0.as_bytes()
   };

    diesel::insert_into(resources).values(&new_resource).execute(conn)?;

    Ok(uuid0)
}

pub fn gallery_item_resource_create_id( 
      name0 : &str
    , description0: &str
    , kinds: (i32,i32)
    , filepath0 : &str 
    , mime0 : &str 
    , gallery0: i32
    , conn: &SqliteConnection 
  ) -> Result<(Uuid,Uuid), diesel::result::Error> {

   use crate::schema::resources::dsl::*;

   conn.transaction(|| {
        let res_uuid = resource_create(filepath0,mime0,kinds.1,conn)?;
    
        let res = resources
                  .filter(uuid.eq(res_uuid.as_bytes().as_ref()))
                  .first::<models::Resource>(conn)?; 
        
        let gi_uuid = gallery_item_create(name0,description0,kinds.0,gallery0, res.id, conn)?;

        Ok((res_uuid, gi_uuid))
    })
}

pub fn gallery_item_resource_create_uuid( 
      name0 : &str
    , description0: &str
    , kinds: (i32,i32)
    , filepath0 : &str 
    , mime0 : &str 
    , gallery0: Uuid
    , conn: &SqliteConnection 
  ) -> Result<(Uuid,Uuid), diesel::result::Error> {

   use crate::schema::resources::dsl::*;

   conn.transaction(|| {
        let res_uuid = resource_create(filepath0,mime0,kinds.1,conn)?;
    
        let res = resources
                  .filter(uuid.eq(res_uuid.as_bytes().as_ref()))
                  .first::<models::Resource>(conn)?; 
        
        let gallery = gallery_by_uuid(gallery0, conn)?.unwrap(); 

        let gi_uuid = gallery_item_create(name0,description0,kinds.0,gallery.id, res.id, conn)?;

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

pub async fn gallery_items_json(
    path: web::Path<Uuid>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let items = web::block(move || {
        let gallery = gallery_by_uuid(*path,&conn)?;
        if gallery.is_some() {
           let items =  gallery_items_by_gallery_uuid(*path,&conn)?;
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


// first field is GalleryItemPost json
// next field is the resource file

#[derive(Serialize,Deserialize)]
enum GalleryUploadError {
    InvalidMimeType
}

pub async fn gallery_item_multipart(
    mut payload: Multipart
  , path: web::Path<Uuid>
  , pool: web::Data<DbPool>
  , permitted : &'static [(i32,&str)]
) -> Result<HttpResponse, actix_web::Error> {

   let conn = pool.get().expect("couldn't get db connection from pool");

   let mut buf = BytesMut::new();
   // NOTE: the outstanding mutable reference makes this
   // hang.  You need to process fields in individual blocks.
   // (eg, cannot call payload.try_next().await within this block)
   if let Ok(Some(mut field)) = payload.try_next().await {
        while let Some(chunk) = field.next().await {
            let data = chunk.unwrap();
            buf.put(data);
        }
   }

   let item : models::GalleryItemPost 
        = serde_json::from_slice(buf.as_ref())
            .map_err(|_| actix_web::error::ParseError::Incomplete)?;

   let mut err = None;

   if let Ok(Some(mut field)) = payload.try_next().await {

        let resid = Uuid::new_v4();
        let mut resid_buf = [b'!'; 40];

        let filepath = format!("./tmp/{}", resid.to_hyphenated().encode_lower(&mut resid_buf));
        let mut f = async_std::fs::File::create(&filepath).await?;

        // Field in turn is stream of *Bytes* object
        while let Some(chunk) = field.next().await {
            let data = chunk.unwrap();
            f.write_all(&data).await?;
        }
        f.flush().await?;
        let fp0 = filepath.clone();
        // use web::block to offload blocking Diesel code without blocking server thread
        let uuid = web::block(move || {
            let p0: &Path = Path::new(&filepath);
            let mime = tree_magic::from_filepath(p0);
            let rkind = permitted.iter().find_map(|&(kind,mime0)| {
                if mime0 == mime {
                    Some(kind)
                }else{
                    None
                } 
            });
            if let Some(rkind)  = rkind {
                let uuid 
                    = gallery_item_resource_create_uuid(
                        &item.name, &item.description, (item.kind,rkind), &filepath, &mime, *path, &conn)?;

                Ok::<_,diesel::result::Error>(Some(uuid))
            }else{
                Ok(None) 
            }
        }).await
          .map_err(|e| {
                eprintln!("{}", e);
                HttpResponse::InternalServerError().finish()
          })?;

        if uuid.is_none() {
            err = Some(GalleryUploadError::InvalidMimeType);
            async_std::fs::remove_file(&fp0).await?;
        }
   }
   if err.is_none() {
        Ok(HttpResponse::Ok().into())
   }else {
        Ok(HttpResponse::BadRequest().json(err))
   }
}

pub async fn gallery_item_multipart_image(
    payload: Multipart
  , path: web::Path<Uuid>
  , pool: web::Data<DbPool>
) -> Result<HttpResponse, actix_web::Error> {
    gallery_item_multipart( payload, path, pool, &[ 
        (1, "image/png")
      , (2, "image/jpeg")
      , (3, "image/gif")
    ]).await
}



pub async fn gallery_item_json(
    path: web::Path<(Uuid,Uuid)>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let item = web::block(move || gallery_item_by_uuid0(path.1,path.0,&conn))
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

pub async fn gallery_item_form(
    path: web::Path<Uuid>,
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
    .service(web::resource("/galleries/create")
        .route(web::get().to(gallery_create_form))
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


