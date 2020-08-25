
use actix_web::{web,HttpResponse};
use handlebars::Handlebars;
use crate::models;
use crate::db::DbPool;
use crate::actions::location::*;

pub async fn location_create_json(
     data : web::Json<models::NewLocationPost>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let uuid = web::block(move || location_create(&data, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    Ok(HttpResponse::Ok().json(uuid))
}

pub async fn location_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let loc = web::block(move || location_by_id(*path, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    if let Some(loc) = loc {
        Ok(HttpResponse::Ok().json(loc))
    }else {
        Ok(HttpResponse::NotFound().finish())
    }
}

pub async fn location_delete_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || location_delete_by_id(*path, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    Ok(HttpResponse::NoContent().finish())
}


pub async fn location_update_by_id_json(
     path: web::Path<i32>
   , data : web::Json<models::NewLocationPost>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    let id = *path;
    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || location_update_by_id(&data,id, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    location_by_id_json(path,pool).await
}


pub async fn location_name_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let loc = web::block(move || location_by_id(*path, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
    if let Some(loc) = loc {
        Ok(HttpResponse::Ok().json(loc.name))
    }else {
        Ok(HttpResponse::NotFound().finish())
    }
}

pub async fn location_description_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let loc = web::block(move || location_by_id(*path, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
    if let Some(loc) = loc {
        Ok(HttpResponse::Ok().json(loc.description))
    }else {
        Ok(HttpResponse::NotFound().finish())
    }
}

pub async fn location_address_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let loc = web::block(move || location_by_id(*path, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
    if let Some(loc) = loc {
        Ok(HttpResponse::Ok().json(loc.address))
    }else {
        Ok(HttpResponse::NotFound().finish())
    }
}

pub async fn location_city_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let loc = web::block(move || location_by_id(*path, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
    if let Some(loc) = loc {
        Ok(HttpResponse::Ok().json(loc.city))
    }else {
        Ok(HttpResponse::NotFound().finish())
    }
}

pub async fn location_region_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let loc = web::block(move || location_by_id(*path, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
    if let Some(loc) = loc {
        Ok(HttpResponse::Ok().json(loc.region))
    }else {
        Ok(HttpResponse::NotFound().finish())
    }
}

pub async fn location_postal_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let loc = web::block(move || location_by_id(*path, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
    if let Some(loc) = loc {
        Ok(HttpResponse::Ok().json(loc.postal))
    }else {
        Ok(HttpResponse::NotFound().finish())
    }
}

pub async fn location_country_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let loc = web::block(move || location_by_id(*path, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
    if let Some(loc) = loc {
        Ok(HttpResponse::Ok().json(loc.country))
    }else {
        Ok(HttpResponse::NotFound().finish())
    }
}

pub async fn location_lat_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let loc = web::block(move || location_by_id(*path, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
    if let Some(loc) = loc {
        Ok(HttpResponse::Ok().json(loc.lat))
    }else {
        Ok(HttpResponse::NotFound().finish())
    }
}

pub async fn location_lng_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let loc = web::block(move || location_by_id(*path, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
    if let Some(loc) = loc {
        Ok(HttpResponse::Ok().json(loc.lng))
    }else {
        Ok(HttpResponse::NotFound().finish())
    }
}

pub async fn location_update_name_by_id_json(
     path: web::Path<i32>
   , data: web::Json<String>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    let id = *path;
    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || location_update_name_by_id(&data, id, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    location_name_by_id_json(path,pool).await
}

pub async fn location_update_description_by_id_json(
     path: web::Path<i32>
   , data: web::Json<Option<String>>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    let id = *path;
    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || location_update_description_by_id(data.as_deref(), id, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    location_description_by_id_json(path,pool).await
}

pub async fn location_update_address_by_id_json(
     path: web::Path<i32>
   , data: web::Json<Option<String>>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    let id = *path;
    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || location_update_address_by_id(data.as_deref(), id, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    location_address_by_id_json(path,pool).await
}

pub async fn location_update_city_by_id_json(
     path: web::Path<i32>
   , data: web::Json<Option<String>>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    let id = *path;
    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || location_update_city_by_id(data.as_deref(), id, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    location_city_by_id_json(path,pool).await
}

pub async fn location_update_region_by_id_json(
     path: web::Path<i32>
   , data: web::Json<Option<String>>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    let id = *path;
    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || location_update_region_by_id(data.as_deref(), id, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    location_region_by_id_json(path,pool).await
}

pub async fn location_update_postal_by_id_json(
     path: web::Path<i32>
   , data: web::Json<Option<String>>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    let id = *path;
    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || location_update_postal_by_id(data.as_deref(), id, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    location_postal_by_id_json(path,pool).await
}

pub async fn location_update_country_by_id_json(
     path: web::Path<i32>
   , data: web::Json<Option<String>>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    let id = *path;
    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || location_update_country_by_id(data.as_deref(), id, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    location_country_by_id_json(path,pool).await
}

pub async fn location_update_lat_by_id_json(
     path: web::Path<i32>
   , data: web::Json<f64>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    let id = *path;
    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || location_update_lat_by_id(*data, id, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    location_lat_by_id_json(path,pool).await
}

pub async fn location_update_lng_by_id_json(
     path: web::Path<i32>
   , data: web::Json<f64>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    let id = *path;
    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || location_update_lng_by_id(*data, id, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    location_lng_by_id_json(path,pool).await
}

pub async fn location_clear_description_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    let id = *path;
    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || location_update_description_by_id(None, id, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    location_description_by_id_json(path,pool).await
}

pub async fn location_clear_address_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    let id = *path;
    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || location_update_address_by_id(None, id, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    location_address_by_id_json(path,pool).await
}

pub async fn location_clear_city_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    let id = *path;
    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || location_update_city_by_id(None, id, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    location_city_by_id_json(path,pool).await
}

pub async fn location_clear_region_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    let id = *path;
    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || location_update_region_by_id(None, id, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    location_region_by_id_json(path,pool).await
}

pub async fn location_clear_postal_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    let id = *path;
    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || location_update_postal_by_id(None, id, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    location_postal_by_id_json(path,pool).await
}

pub async fn location_clear_country_by_id_json(
     path: web::Path<i32>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    let id = *path;
    // use web::block to offload blocking Diesel code without blocking server thread
    web::block(move || location_update_country_by_id(None, id, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    location_country_by_id_json(path,pool).await
}

pub async fn locations_listing_json(
   pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let locations = web::block(move || locations_all(&conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
    
    Ok(HttpResponse::Ok().json(locations))
}

pub async fn locations_by_distance_json(
    params: web::Path<(f64,f64,f64)>
  , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let locations = web::block(move || locations_by_distance(params.0,params.1,params.2,&conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
    
    Ok(HttpResponse::Ok().json(locations))
}

pub async fn location_create_form(hb: web::Data<Handlebars<'_>>) -> HttpResponse {
    let data = json!({
        "title": "Add A Location"
      , "parent" : "main"
    });
    let body = hb.render("content/location-create", &data).unwrap();

    HttpResponse::Ok().body(body)
}

pub async fn location_show_all_html(hb: web::Data<Handlebars<'_>>) -> HttpResponse {
    let data = json!({
        "title": "Locations"
      , "parent" : "main"
      , "json_url" : "http://localhost:8080/locations"
    });
    let body = hb.render("content/location-show", &data).unwrap();

    HttpResponse::Ok().body(body)
}

pub async fn locations_by_distance_html(hb: web::Data<Handlebars<'_>>) -> HttpResponse {
    let data = json!({
        "title": "Locations By Distance"
      , "parent" : "main"
    });
    let body = hb.render("content/location-by-distance", &data).unwrap();

    HttpResponse::Ok().body(body)
}

pub async fn location_show_html(
     path: web::Path<i32>
   , hb: web::Data<Handlebars<'_>>
) -> HttpResponse {
    // FIXME: 404, etc.
    let data = json!({
        "title": "Locations"
      , "parent" : "main"
      , "json_url" : format!("http://localhost:8080/locations/{}", *path)
    });
    let body = hb.render("content/location-show", &data).unwrap();

    HttpResponse::Ok().body(body)
}

pub fn locations_api_read( cfg: &mut web::ServiceConfig ) {
    cfg
      .service(
          web::resource("/locations")
            .route(web::get().to(locations_listing_json))
        )
      .service(
          web::resource("/locations/by_distance/{lat}/{lng}/{distance}")
            .route(web::get().to(locations_by_distance_json))
        )
      .service(
          web::resource("/locations/{id}")
            .route(web::get().to(location_by_id_json))
        )
      .service(
          web::resource("/locations/{id}/name")
            .route(web::get().to(location_name_by_id_json))
        )
      .service(
          web::resource("/locations/{id}/description")
            .route(web::get().to(location_description_by_id_json))
        )
      .service(
          web::resource("/locations/{id}/address")
            .route(web::get().to(location_address_by_id_json))
        )
      .service(
          web::resource("/locations/{id}/city")
            .route(web::get().to(location_city_by_id_json))
        )
      .service(
          web::resource("/locations/{id}/region")
            .route(web::get().to(location_region_by_id_json))
        )
      .service(
          web::resource("/locations/{id}/postal")
            .route(web::get().to(location_postal_by_id_json))
        )
      .service(
          web::resource("/locations/{id}/country")
            .route(web::get().to(location_country_by_id_json))
        )
      .service(
          web::resource("/locations/{id}/lat")
            .route(web::get().to(location_lat_by_id_json))
        )
      .service(
          web::resource("/locations/{id}/lng")
            .route(web::get().to(location_lng_by_id_json))
        );
}

pub fn locations_api_write( cfg: &mut web::ServiceConfig ) {
    cfg
      .service(
          web::resource("/locations/create")
            .route(web::post().to(location_create_json))
        )
      .service(
          web::resource("/locations/{id}")
            .route(web::post().to(location_update_by_id_json))
            .route(web::delete().to(location_delete_by_id_json))
        )
      .service(
          web::resource("/locations/{id}/name")
            .route(web::post().to(location_update_name_by_id_json))
            .route(web::put().to(location_update_name_by_id_json))
        )
      .service(
          web::resource("/locations/{id}/description")
            .route(web::post().to(location_update_description_by_id_json))
            .route(web::put().to(location_update_description_by_id_json))
            .route(web::delete().to(location_clear_description_by_id_json))
        )
      .service(
          web::resource("/locations/{id}/address")
            .route(web::post().to(location_update_address_by_id_json))
            .route(web::put().to(location_update_address_by_id_json))
            .route(web::delete().to(location_clear_address_by_id_json))
        )
      .service(
          web::resource("/locations/{id}/city")
            .route(web::post().to(location_update_city_by_id_json))
            .route(web::put().to(location_update_city_by_id_json))
            .route(web::delete().to(location_clear_city_by_id_json))
        )
      .service(
          web::resource("/locations/{id}/region")
            .route(web::post().to(location_update_region_by_id_json))
            .route(web::put().to(location_update_region_by_id_json))
            .route(web::delete().to(location_clear_region_by_id_json))
        )
      .service(
          web::resource("/locations/{id}/postal")
            .route(web::post().to(location_update_postal_by_id_json))
            .route(web::put().to(location_update_postal_by_id_json))
            .route(web::delete().to(location_clear_postal_by_id_json))
        )
      .service(
          web::resource("/locations/{id}/country")
            .route(web::post().to(location_update_country_by_id_json))
            .route(web::put().to(location_update_country_by_id_json))
            .route(web::delete().to(location_clear_country_by_id_json))
        )
      .service(
          web::resource("/locations/{id}/lat")
            .route(web::post().to(location_update_lat_by_id_json))
            .route(web::put().to(location_update_lat_by_id_json))
        )
      .service(
          web::resource("/locations/{id}/lng")
            .route(web::post().to(location_update_lng_by_id_json))
            .route(web::put().to(location_update_lng_by_id_json))
        );
}

pub fn locations_api_all( cfg: &mut web::ServiceConfig ) {
    cfg
      .service(
          web::resource("/locations")
            .route(web::get().to(locations_listing_json))
        )
      .service(
          web::resource("/locations/by_distance")
            .route(web::get().to(locations_by_distance_html))
        )
      .service(
          web::resource("/locations/show")
            .route(web::get().to(location_show_all_html))
        )
      .service(
          web::resource("/locations/show/{location}")
            .route(web::get().to(location_show_html))
        )
      .service(
          web::resource("/locations/create")
            .route(web::get().to(location_create_form))
            .route(web::post().to(location_create_json))
        )
      .service(
          web::resource("/locations/by_distance/{lat}/{lng}/{distance}")
            .route(web::get().to(locations_by_distance_json))
        )
      .service(
          web::resource("/locations/{id}")
            .route(web::get().to(location_by_id_json))
            .route(web::post().to(location_update_by_id_json))
            .route(web::delete().to(location_delete_by_id_json))
        )
      .service(
          web::resource("/locations/{id}/name")
            .route(web::get().to(location_name_by_id_json))
            .route(web::post().to(location_update_name_by_id_json))
            .route(web::put().to(location_update_name_by_id_json))
        )
      .service(
          web::resource("/locations/{id}/description")
            .route(web::get().to(location_description_by_id_json))
            .route(web::post().to(location_update_description_by_id_json))
            .route(web::put().to(location_update_description_by_id_json))
            .route(web::delete().to(location_clear_description_by_id_json))
        )
      .service(
          web::resource("/locations/{id}/address")
            .route(web::get().to(location_address_by_id_json))
            .route(web::post().to(location_update_address_by_id_json))
            .route(web::put().to(location_update_address_by_id_json))
            .route(web::delete().to(location_clear_address_by_id_json))
        )
      .service(
          web::resource("/locations/{id}/city")
            .route(web::get().to(location_city_by_id_json))
            .route(web::post().to(location_update_city_by_id_json))
            .route(web::put().to(location_update_city_by_id_json))
            .route(web::delete().to(location_clear_city_by_id_json))
        )
      .service(
          web::resource("/locations/{id}/region")
            .route(web::get().to(location_region_by_id_json))
            .route(web::post().to(location_update_region_by_id_json))
            .route(web::put().to(location_update_region_by_id_json))
            .route(web::delete().to(location_clear_region_by_id_json))
        )
      .service(
          web::resource("/locations/{id}/postal")
            .route(web::get().to(location_postal_by_id_json))
            .route(web::post().to(location_update_postal_by_id_json))
            .route(web::put().to(location_update_postal_by_id_json))
            .route(web::delete().to(location_clear_postal_by_id_json))
        )
      .service(
          web::resource("/locations/{id}/country")
            .route(web::get().to(location_country_by_id_json))
            .route(web::post().to(location_update_country_by_id_json))
            .route(web::put().to(location_update_country_by_id_json))
            .route(web::delete().to(location_clear_country_by_id_json))
        )
      .service(
          web::resource("/locations/{id}/lat")
            .route(web::get().to(location_lat_by_id_json))
            .route(web::post().to(location_update_lat_by_id_json))
            .route(web::put().to(location_update_lat_by_id_json))
        )
      .service(
          web::resource("/locations/{id}/lng")
            .route(web::get().to(location_lng_by_id_json))
            .route(web::post().to(location_update_lng_by_id_json))
            .route(web::put().to(location_update_lng_by_id_json))
        );
}

pub fn locations_api( cfg: &mut web::ServiceConfig ) {
    locations_api_all(cfg);
}

