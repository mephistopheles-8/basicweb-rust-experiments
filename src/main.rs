#[macro_use]
extern crate diesel;
#[macro_use]
extern crate serde_json;

use actix_files as fs;
use handlebars::Handlebars;
use actix_web::{middleware, web, App, HttpResponse, HttpServer};
use actix_http::{body::Body, Response};
use actix_web::dev::ServiceResponse;
use actix_web::http::StatusCode;
use actix_web::middleware::errhandlers::{ErrorHandlerResponse, ErrorHandlers};
use actix_multipart::Multipart;
use async_std::prelude::*;
use futures::{StreamExt, TryStreamExt};
use diesel::prelude::*;
use diesel::r2d2::{self, ConnectionManager};
use uuid::Uuid;
use serde::{Serialize,Deserialize};

mod schema;
mod models;

type DbPool = r2d2::Pool<ConnectionManager<SqliteConnection>>;

async fn save_file(mut payload: Multipart) -> Result<HttpResponse, actix_web::Error> {
    // iterate over multipart stream
    while let Ok(Some(mut field)) = payload.try_next().await {
        let content_type = field
            .content_disposition()
            .ok_or_else(|| actix_web::error::ParseError::Incomplete)?;
        let filename = content_type
            .get_filename()
            .ok_or_else(|| actix_web::error::ParseError::Incomplete)?;
        let filepath = format!("./tmp/{}", sanitize_filename::sanitize(&filename));
        let mut f = async_std::fs::File::create(filepath).await?;

        // Field in turn is stream of *Bytes* object
        while let Some(chunk) = field.next().await {
            let data = chunk.unwrap();
            f.write_all(&data).await?;
        }
    }
    Ok(HttpResponse::Ok().into())
}

fn file_upload() -> HttpResponse {
    let html = r#"<html>
        <head><title>Upload Test</title></head>
        <body>
            <form target="/" method="post" enctype="multipart/form-data">
                <input type="file" multiple name="file"/>
                <button type="submit">Submit</button>
            </form>
        </body>
    </html>"#;

    HttpResponse::Ok().body(html)
}

fn galleries_all ( conn: &SqliteConnection ) 
    -> Result<Vec<models::Gallery>, diesel::result::Error> {

    use crate::schema::galleries::dsl::*;
    let g0s = galleries.load( conn )?; 
    Ok(g0s)
}

fn gallery_by_id ( id0: i32, conn: &SqliteConnection ) 
    -> Result<Option<models::Gallery>, diesel::result::Error> {

    use crate::schema::galleries::dsl::*;
    let g0s = galleries
             .filter(id.eq(id0))
             .first::<models::Gallery>( conn )
             .optional()?; 
    Ok(g0s)
}

fn gallery_by_uuid ( uuid0: Uuid, conn: &SqliteConnection ) 
    -> Result<Option<models::Gallery>, diesel::result::Error> {

    use crate::schema::galleries::dsl::*;
    let g0s = galleries
              .filter(uuid.eq(uuid0.as_bytes().as_ref()))
              .first::<models::Gallery>( conn )
              .optional()?; 
    Ok(g0s)
}

fn gallery_items_by_gallery ( gallery_id: i32, conn: &SqliteConnection ) 
    -> Result<Vec<(models::GalleryItem, models::Resource)>, diesel::result::Error> {

    use crate::schema::gallery_items::dsl::*;
    use crate::schema::resources::dsl::*;

    let g0s = gallery_items
              .filter(gallery.eq(gallery_id))
              .inner_join(resources)
              .load( conn )?; 
    Ok(g0s)
}


fn gallery_item_by_id ( id0: i32, conn: &SqliteConnection ) 
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

fn gallery_item_by_id0 ( id0: i32, gallery0: i32, conn: &SqliteConnection ) 
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

fn gallery_item_by_uuid ( uuid0: Uuid, conn: &SqliteConnection ) 
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

fn gallery_create(
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

fn gallery_item_create( 
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

fn gallery_item_resource_create( 
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


async fn gallery_listing_json(
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
struct GalleryPost {
    name : String,
    description : String,
    kind : i32,
}

async fn gallery_create_json(
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

async fn gallery_json(
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

async fn gallery_items_json(
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
struct GalleryItemPost {
    name : String,
    description : String,
    kind : i32,
}

// first field is GalleryItemPost json
// next field is the resource file

async fn gallery_item_multipart(
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



async fn gallery_item_json(
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

async fn gallery_item_form(
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

async fn index(hb: web::Data<Handlebars<'_>>) -> HttpResponse {
    let data = json!({
        "title": "Welcome"
      , "parent" : "main"
    });
    let body = hb.render("content/index", &data).unwrap();

    HttpResponse::Ok().body(body)
}

fn gallery_api_read( cfg: &mut web::ServiceConfig ) {
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

fn gallery_api_write( cfg: &mut web::ServiceConfig ) {
    cfg
    .service(web::resource("/galleries")
        .route(web::post().to(gallery_create_json))
    )
    .service(web::resource("/galleries/{id}/items")
        .route(web::post().to(gallery_item_multipart))
    );
}


fn gallery_api( cfg: &mut web::ServiceConfig ) {
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


#[actix_rt::main]
async fn main() -> std::io::Result<()> {
    std::env::set_var("RUST_LOG", "actix_web=info");
    env_logger::init();
    dotenv::dotenv().ok();

    // set up database connection pool
    let connspec = std::env::var("DATABASE_URL").expect("DATABASE_URL");
    let manager = ConnectionManager::<SqliteConnection>::new(connspec);
    let pool = r2d2::Pool::builder()
        .build(manager)
        .expect("Failed to create pool.");

    // Handlebar templates
    
    let mut handlebars = Handlebars::new();
    handlebars
        .register_templates_directory(".html", "./static/templates")
        .unwrap();
    let handlebars_ref = web::Data::new(handlebars);

    HttpServer::new(move || {
        App::new()
            // db pool
            .data(pool.clone())
            // handlebars
            .app_data(handlebars_ref.clone())
            // error handlers
            .wrap(error_handlers())
            // logger (must be last)
            .wrap(middleware::Logger::default())
            // the gallery api
            .configure(gallery_api)
            .service(web::resource("/").route(web::get().to(index)))
            .service(fs::Files::new("/", "./static/root/"))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}

// Error logic taken from examples

// Custom error handlers, to return HTML responses when an error occurs.
fn error_handlers() -> ErrorHandlers<Body> {
    ErrorHandlers::new().handler(StatusCode::NOT_FOUND, not_found)
}

// Error handler for a 404 Page not found error.
fn not_found<B>(res: ServiceResponse<B>) -> actix_web::Result<ErrorHandlerResponse<B>> {
    let response = get_error_response(&res, "Page not found");
    Ok(ErrorHandlerResponse::Response(
        res.into_response(response.into_body()),
    ))
}

// Generic error handler.
fn get_error_response<B>(res: &ServiceResponse<B>, error: &str) -> Response<Body> {
    let request = res.request();

    // Provide a fallback to a simple plain text response in case an error occurs during the
    // rendering of the error page.
    let fallback = |e: &str| {
        Response::build(res.status())
            .content_type("text/plain")
            .body(e.to_string())
    };

    let hb = request
        .app_data::<web::Data<Handlebars>>()
        .map(|t| t.get_ref());
   

    match hb {
        Some(hb) => {
            let data = json!({
                "title": error
              , "parent" : "main"
              , "error": error
              , "status_code": res.status().as_str()
            });
            let body = hb.render("error", &data);

            match body {
                Ok(body) => Response::build(res.status())
                    .content_type("text/html")
                    .body(body),
                Err(_) => fallback(error),
            }
        }
        None => fallback(error),
    }
}
