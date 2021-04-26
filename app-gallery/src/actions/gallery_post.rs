use diesel::prelude::*;
use crate::models;
use crate::db::Connection as Conn;
use uuid::Uuid;

pub fn gallery_post_create(
      gallery0 : i32
    , post0: i32 
    , conn: &Conn 
  ) -> Result<usize, diesel::result::Error> {
    use crate::schema::gallery_posts::dsl::*;

    let new_gallery_post = models::GalleryPostNew {
        gallery : gallery0
     ,  post: post0
    };

    diesel::insert_into(gallery_posts).values(&new_gallery_post).execute(conn)
}

pub fn gallery_post_create_uuid(
      gallery0 : Uuid
    , post0: Uuid 
    , conn: &Conn 
  ) -> Result<usize, diesel::result::Error> {

    use crate::schema::*;

    let g0 = galleries::table
             .filter(galleries::uuid.eq(gallery0.as_bytes().as_ref()))
             .select(galleries::id)
             .first::<i32>(conn)?;

    let p0 = posts::table
             .filter(posts::uuid.eq(post0.as_bytes().as_ref()))
             .select(posts::id)
             .first::<i32>(conn)?;

      gallery_post_create(g0,p0,conn)
}

pub fn gallery_posts_by_id(
      gallery0 : i32
    , conn: &Conn 
  ) -> Result<Vec<models::Post>, diesel::result::Error> {

    use crate::schema::*;

    gallery_posts::table
        .filter(galleries::id.eq(gallery0))
        .inner_join(galleries::table)
        .inner_join(posts::table)
        .select(posts::all_columns)
        .load(conn)
}

pub fn post_galleries_by_id(
      post0 : i32
    , conn: &Conn 
  ) -> Result<Vec<models::Gallery>, diesel::result::Error> {

    use crate::schema::*;

    gallery_posts::table
        .filter(posts::id.eq(post0))
        .inner_join(posts::table)
        .inner_join(galleries::table)
        .select(galleries::all_columns)
        .load(conn)
}

pub fn gallery_posts_by_uuid(
      gallery0 : Uuid
    , conn: &Conn 
  ) -> Result<Vec<models::Post>, diesel::result::Error> {

    use crate::schema::*;

    gallery_posts::table
        .filter(galleries::uuid.eq(gallery0.as_bytes().as_ref()))
        .inner_join(galleries::table)
        .inner_join(posts::table)
        .select(posts::all_columns)
        .load(conn)
}

pub fn post_galleries_by_uuid(
      post0 : Uuid
    , conn: &Conn 
  ) -> Result<Vec<models::Gallery>, diesel::result::Error> {

    use crate::schema::*;

    gallery_posts::table
        .filter(posts::uuid.eq(post0.as_bytes().as_ref()))
        .inner_join(posts::table)
        .inner_join(galleries::table)
        .select(galleries::all_columns)
        .load(conn)
}


