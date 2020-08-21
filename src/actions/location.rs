
use diesel::prelude::*;
use uuid::Uuid;

use diesel::sql_types::Double;
use crate::models;
use crate::db::Connection;

sql_function!(fn haversine(lat0: Double, lng0: Double, lat1: Double, lng1: Double) -> Double);

pub fn initialize( conn: &Connection ) 
    -> Result<(), diesel::result::Error> {
    haversine::register_impl(&conn, |lat0: f64, lng0: f64, lat1: f64, lng1: f64| {
        let r = 6371.0; // radius of earth in kilometers
        let d_lat = (lat1 - lat0).to_radians();
        let d_lon = (lng1 - lng0).to_radians();
        let lat0r = lat0.to_radians();
        let lat1r = lat1.to_radians();
         
        let a  = ((d_lat/2.0).sin()) * ((d_lat/2.0).sin()) 
               + ((d_lon/2.0).sin()) * ((d_lon/2.0).sin()) * (lat0r.cos()) * (lat1r.cos());

        let c  = 2.0 * ((a.sqrt()).atan2((1.0-a).sqrt()));

        r * c
    })
}

pub fn locations_all ( conn: &Connection ) 
    -> Result<Vec<models::Location>, diesel::result::Error> {

    use crate::schema::locations::dsl::*;
    let g0s = locations.order_by(name).load( conn )?; 
    Ok(g0s)
}

pub fn locations_by_distance ( lat0: f64, lng0: f64, dist: f64, conn: &Connection ) 
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

pub fn location_by_id ( id0: i32, conn: &Connection ) 
    -> Result<Option<models::Location>, diesel::result::Error> {

    use crate::schema::locations::dsl::*;
    let g0s = locations
             .filter(id.eq(id0))
             .first::<models::Location>( conn )
             .optional()?; 
    Ok(g0s)
}

pub fn location_by_uuid ( uuid0: Uuid, conn: &Connection ) 
    -> Result<Option<models::Location>, diesel::result::Error> {

    use crate::schema::locations::dsl::*;
    let g0s = locations
              .filter(uuid.eq(uuid0.as_bytes().as_ref()))
              .first::<models::Location>( conn )
              .optional()?; 
    Ok(g0s)
}

pub fn location_delete_by_id ( id0: i32, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::locations::dsl::*;
    diesel::delete(locations.filter(id.eq(id0))).execute(conn)
}

pub fn location_delete_by_uuid ( uuid0: Uuid, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::locations::dsl::*;
    diesel::delete(locations.filter(uuid.eq(uuid0.as_bytes().as_ref()))).execute(conn)
}

pub fn location_update_name_by_id ( name0: &str, id0: i32, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::locations::dsl::*;
    diesel::update(locations.filter(id.eq(id0))).set(name.eq(name0)).execute(conn)
}

pub fn location_update_description_by_id ( description0: Option<&str>, id0: i32, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::locations::dsl::*;
    diesel::update(locations.filter(id.eq(id0))).set(description.eq(description0)).execute(conn)
}

pub fn location_update_address_by_id ( address0: Option<&str>, id0: i32, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::locations::dsl::*;
    diesel::update(locations.filter(id.eq(id0))).set(address.eq(address0)).execute(conn)
}

pub fn location_update_city_by_id ( city0: Option<&str>, id0: i32, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::locations::dsl::*;
    diesel::update(locations.filter(id.eq(id0))).set(city.eq(city0)).execute(conn)
}

pub fn location_update_region_by_id ( region0: Option<&str>, id0: i32, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::locations::dsl::*;
    diesel::update(locations.filter(id.eq(id0))).set(region.eq(region0)).execute(conn)
}

pub fn location_update_postal_by_id ( postal0: Option<&str>, id0: i32, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::locations::dsl::*;
    diesel::update(locations.filter(id.eq(id0))).set(postal.eq(postal0)).execute(conn)
}

pub fn location_update_country_by_id ( country0: Option<&str>, id0: i32, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::locations::dsl::*;
    diesel::update(locations.filter(id.eq(id0))).set(country.eq(country0)).execute(conn)
}

pub fn location_update_lat_by_id ( lat0: f64, id0: i32, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::locations::dsl::*;
    diesel::update(locations.filter(id.eq(id0))).set(lat.eq(lat0)).execute(conn)
}

pub fn location_update_lng_by_id ( lng0: f64, id0: i32, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::locations::dsl::*;
    diesel::update(locations.filter(id.eq(id0))).set(lng.eq(lng0)).execute(conn)
}

pub fn location_create( 
        loc: &models::NewLocationPost, conn: &Connection 
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
        loc: &models::NewLocationPost, id0: i32, conn: &Connection 
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
        loc: &models::NewLocationPost, uuid0: Uuid, conn: &Connection 
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
