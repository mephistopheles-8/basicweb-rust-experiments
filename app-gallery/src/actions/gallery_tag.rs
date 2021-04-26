
use diesel::prelude::*;
use crate::db::{Connection as Conn};
use crate::models;

use uuid::Uuid;

/// Replace existing gallery tags with
/// those in the vector.

pub fn gallery_tags_create_by_id( 
     gid: i32
   , tags0: &Vec<models::Tag>
   , conn: &Conn 
    ) -> Result<usize, diesel::result::Error> {

    use crate::schema::gallery_tags::dsl::*;

    let inserts : Vec<_>
        = tags0.iter().map(|tag0|
            (gallery.eq(gid),tag.eq(tag0.id))).collect(); 

    conn.transaction(|| {
        diesel::delete(gallery_tags.filter(gallery.eq(gid))).execute(conn)?;
        diesel::insert_into(gallery_tags).values(inserts).execute(conn)
    })
}

pub fn gallery_tags_create_by_uuid( 
     gid: Uuid
   , tags0: &Vec<models::Tag>
   , conn: &Conn 
    ) -> Result<usize, diesel::result::Error> {

    use crate::schema::*;

    let g0 = galleries::table
        .filter(galleries::uuid.eq(gid.as_bytes().as_ref()))
        .first::<models::Gallery>(conn)?;

    gallery_tags_create_by_id( g0.id, tags0, conn )
}

pub fn gallery_tags_by_id( 
     gid: i32
   , conn: &Conn 
    ) -> Result<Vec<models::Tag>, diesel::result::Error> {

    use crate::schema::*;

    gallery_tags::table
        .filter(gallery_tags::gallery.eq(gid))
        .inner_join(tags::table)
        .select(tags::all_columns)
        .order_by(tags::name)
        .load(conn)
}

pub fn gallery_tags_by_uuid( 
     gid: Uuid
   , conn: &Conn 
    ) -> Result<Vec<models::Tag>, diesel::result::Error> {

    use crate::schema::*;

    let g0 = galleries::table
        .filter(galleries::uuid.eq(gid.as_bytes().as_ref()))
        .first::<models::Gallery>(conn)?;

    gallery_tags_by_id( g0.id, conn )
}


