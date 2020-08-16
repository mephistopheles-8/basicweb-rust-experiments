
#[macro_use]
extern crate diesel;
#[macro_use]
extern crate serde_json;

use actix_web::{web,HttpResponse};
use diesel::prelude::*;
use diesel::r2d2::{self, ConnectionManager};
use uuid::Uuid;
use serde::{Serialize,Deserialize};
use handlebars::Handlebars;

use ::r2d2::CustomizeConnection;

use diesel::sql_types::Double;

pub mod models;
pub mod schema;
pub mod util;

pub type DbPool = r2d2::Pool<ConnectionManager<SqliteConnection>>;

#[derive(Serialize,Deserialize)]
pub struct NewLocationPost{
    pub name: String,
    pub description: Option<String>,
    pub address: Option<String>,
    pub city: Option<String>,
    pub region: Option<String>,
    pub postal: Option<String>,
    pub country: Option<String>,
    pub lat: f64,
    pub lng: f64,
}

sql_function!(fn haversine(lat0: Double, lng0: Double, lat1: Double, lng1: Double) -> Double);

pub fn initialize( conn: &SqliteConnection ) 
    -> Result<(), diesel::result::Error> {
    haversine::register_impl(&conn, |lat0: f64, lng0: f64, lat1: f64, lng1: f64| {
        let r = 6371.0; // radius of earth in kilometers
        let d_lat = (lat1 - lat0).to_radians();
        let d_lon = (lng1 - lng0).to_radians();
        let lat0r = lat0.to_radians();
        let lat1r = lat1.to_radians();
         
        let a  = ((d_lat/2.0).sin()) * ((d_lat/2.0).sin()) + ((d_lon/2.0).sin()) * ((d_lon/2.0).sin()) * (lat0r.cos()) * (lat1r.cos());
        let c  = 2.0 * ((a.sqrt()).atan2((1.0-a).sqrt()));

        r * c
    })
}

// FIXME: This is erroring out with r2d2 Pool builder; wrong error type?
#[derive(Debug)]
pub struct LocationSqliteCustomizer;
impl CustomizeConnection<SqliteConnection,diesel::result::Error> for LocationSqliteCustomizer {
    fn on_acquire(&self, conn: &mut SqliteConnection) -> Result<(),diesel::result::Error> {
        initialize(conn)
    }
}

pub fn locations_all ( conn: &SqliteConnection ) 
    -> Result<Vec<models::Location>, diesel::result::Error> {

    use crate::schema::locations::dsl::*;
    let g0s = locations.order_by(name).load( conn )?; 
    Ok(g0s)
}

pub fn locations_by_distance ( lat0: f64, lng0: f64, dist: f64, conn: &SqliteConnection ) 
    -> Result<Vec<(f64,models::Location)>, diesel::result::Error> {

    use crate::schema::locations::dsl::*;
    // TODO: Make sure this doesn't have side-effects
    initialize(conn)?;
    // FIXME: this calls haversine 3 times per result! Fix it.
    let dist_calc = haversine(lat,lng,lat0,lng0);
    let g0s = locations.select(
          ( dist_calc, locations::all_columns() )
        ).filter(
            dist_calc.lt(dist)
        ).order_by(dist_calc.asc()).load( conn )?; 
    Ok(g0s)
}

pub fn location_by_id ( id0: i32, conn: &SqliteConnection ) 
    -> Result<Option<models::Location>, diesel::result::Error> {

    use crate::schema::locations::dsl::*;
    let g0s = locations
             .filter(id.eq(id0))
             .first::<models::Location>( conn )
             .optional()?; 
    Ok(g0s)
}

pub fn location_by_uuid ( uuid0: Uuid, conn: &SqliteConnection ) 
    -> Result<Option<models::Location>, diesel::result::Error> {

    use crate::schema::locations::dsl::*;
    let g0s = locations
              .filter(uuid.eq(uuid0.as_bytes().as_ref()))
              .first::<models::Location>( conn )
              .optional()?; 
    Ok(g0s)
}

pub fn location_delete_by_id ( id0: i32, conn: &SqliteConnection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::locations::dsl::*;
    diesel::delete(locations.filter(id.eq(id0))).execute(conn)
}

pub fn location_delete_by_uuid ( uuid0: Uuid, conn: &SqliteConnection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::locations::dsl::*;
    diesel::delete(locations.filter(uuid.eq(uuid0.as_bytes().as_ref()))).execute(conn)
}

pub fn location_update_name_by_id ( name0: &str, id0: i32, conn: &SqliteConnection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::locations::dsl::*;
    diesel::update(locations.filter(id.eq(id0))).set(name.eq(name0)).execute(conn)
}

pub fn location_update_description_by_id ( description0: Option<&str>, id0: i32, conn: &SqliteConnection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::locations::dsl::*;
    diesel::update(locations.filter(id.eq(id0))).set(description.eq(description0)).execute(conn)
}

pub fn location_update_address_by_id ( address0: Option<&str>, id0: i32, conn: &SqliteConnection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::locations::dsl::*;
    diesel::update(locations.filter(id.eq(id0))).set(address.eq(address0)).execute(conn)
}

pub fn location_update_city_by_id ( city0: Option<&str>, id0: i32, conn: &SqliteConnection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::locations::dsl::*;
    diesel::update(locations.filter(id.eq(id0))).set(city.eq(city0)).execute(conn)
}

pub fn location_update_region_by_id ( region0: Option<&str>, id0: i32, conn: &SqliteConnection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::locations::dsl::*;
    diesel::update(locations.filter(id.eq(id0))).set(region.eq(region0)).execute(conn)
}

pub fn location_update_postal_by_id ( postal0: Option<&str>, id0: i32, conn: &SqliteConnection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::locations::dsl::*;
    diesel::update(locations.filter(id.eq(id0))).set(postal.eq(postal0)).execute(conn)
}

pub fn location_update_country_by_id ( country0: Option<&str>, id0: i32, conn: &SqliteConnection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::locations::dsl::*;
    diesel::update(locations.filter(id.eq(id0))).set(country.eq(country0)).execute(conn)
}

pub fn location_update_lat_by_id ( lat0: f64, id0: i32, conn: &SqliteConnection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::locations::dsl::*;
    diesel::update(locations.filter(id.eq(id0))).set(lat.eq(lat0)).execute(conn)
}

pub fn location_update_lng_by_id ( lng0: f64, id0: i32, conn: &SqliteConnection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::locations::dsl::*;
    diesel::update(locations.filter(id.eq(id0))).set(lng.eq(lng0)).execute(conn)
}

pub fn location_create( 
        loc: &NewLocationPost, conn: &SqliteConnection 
    ) -> Result<Uuid, diesel::result::Error> {

    use crate::schema::locations::dsl::*;

    let uuid0 = Uuid::new_v4();

    let new_location = models::NewLocation {
        name: &loc.name,
        description: loc.description.as_deref(),
        address: loc.address.as_deref(),
        city: loc.city.as_deref(),
        region: loc.region.as_deref(),
        postal: loc.postal.as_deref(),
        country: loc.country.as_deref(),
        lat: loc.lat,
        lng: loc.lng,
        uuid: uuid0.as_bytes(),
    };

    diesel::insert_into(locations).values(&new_location).execute(conn)?;
    Ok(uuid0)
}

pub fn location_update_by_id( 
        loc: &NewLocationPost, id0: i32, conn: &SqliteConnection 
    ) -> Result<usize, diesel::result::Error> {

    use crate::schema::locations::dsl::*;

    let loc_upd = models::LocationUpdate {
        name: &loc.name,
        description: loc.description.as_deref(),
        address: loc.address.as_deref(),
        city: loc.city.as_deref(),
        region: loc.region.as_deref(),
        postal: loc.postal.as_deref(),
        country: loc.country.as_deref(),
        lat: loc.lat,
        lng: loc.lng,
    };

    diesel::update(locations.filter(id.eq(id0))).set(&loc_upd).execute(conn)
}

pub fn location_update_by_uuid( 
        loc: &NewLocationPost, uuid0: Uuid, conn: &SqliteConnection 
    ) -> Result<usize, diesel::result::Error> {

    use crate::schema::locations::dsl::*;

    let loc_upd = models::LocationUpdate {
        name: &loc.name,
        description: loc.description.as_deref(),
        address: loc.address.as_deref(),
        city: loc.city.as_deref(),
        region: loc.region.as_deref(),
        postal: loc.postal.as_deref(),
        country: loc.country.as_deref(),
        lat: loc.lat,
        lng: loc.lng,
    };

    diesel::update(locations.filter(uuid.eq(uuid0.as_bytes().as_ref()))).set(&loc_upd).execute(conn)
}

pub async fn location_create_json(
     data : web::Json<NewLocationPost>
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
   , data : web::Json<NewLocationPost>
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

pub async fn index(hb: web::Data<Handlebars<'_>>) -> HttpResponse {
    let data = json!({
        "title": "Welcome"
      , "parent" : "main"
    });
    let body = hb.render("content/index", &data).unwrap();

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
          web::resource("/locations/create")
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

