
use diesel::prelude::*;
use crate::models;
use crate::db::Connection as Connection0;
use uuid::Uuid;

pub fn gallery_create(
      data : &models::GalleryUpd
    , conn: &Connection0 
  ) -> Result<Uuid, diesel::result::Error> {
    use crate::schema::galleries::dsl::*;

    let uuid0 = Uuid::new_v4();

    let new_gallery = models::GalleryNew {
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
    , data : &models::GalleryUpd
    , conn: &Connection0 
  ) -> Result<usize, diesel::result::Error> {
    use crate::schema::galleries::dsl::*;

    diesel::update(galleries.filter(id.eq(id0))).set(data).execute(conn)
}

pub fn gallery_update_by_uuid(
      uuid0 : Uuid
    , data : &models::GalleryUpd
    , conn: &Connection0 
  ) -> Result<usize, diesel::result::Error> {
    use crate::schema::galleries::dsl::*;

    diesel::update(galleries.filter(uuid.eq(uuid0.as_bytes().as_ref()))).set(data).execute(conn)
}

pub fn galleries_all ( conn: &Connection0 ) 
    -> Result<Vec<models::Gallery>, diesel::result::Error> {

    use crate::schema::galleries::dsl::*;
    let g0s = galleries.load( conn )?; 
    Ok(g0s)
}

pub fn gallery_by_id ( id0: i32, conn: &Connection0 ) 
    -> Result<Option<models::Gallery>, diesel::result::Error> {

    use crate::schema::galleries::dsl::*;
    let g0s = galleries
             .filter(id.eq(id0))
             .first::<models::Gallery>( conn )
             .optional()?; 
    Ok(g0s)
}

pub fn gallery_by_uuid ( uuid0: Uuid, conn: &Connection0 ) 
    -> Result<Option<models::Gallery>, diesel::result::Error> {

    use crate::schema::galleries::dsl::*;
    let g0s = galleries
              .filter(uuid.eq(uuid0.as_bytes().as_ref()))
              .first::<models::Gallery>( conn )
              .optional()?; 
    Ok(g0s)
}
