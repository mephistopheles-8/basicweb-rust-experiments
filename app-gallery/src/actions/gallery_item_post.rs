
use diesel::prelude::*;
use crate::models;
use crate::db::Connection as Conn;
use uuid::Uuid;

pub fn gallery_item_post_create(
      gallery_item0 : i32
    , post0: i32 
    , conn: &Conn 
  ) -> Result<usize, diesel::result::Error> {
    use crate::schema::gallery_item_posts::dsl::*;

    let new_gallery_item_post = models::GalleryItemPostNew {
        gallery_item : gallery_item0
     ,  post: post0
    };

    diesel::insert_into(gallery_item_posts).values(&new_gallery_item_post).execute(conn)
}

pub fn gallery_item_post_create_uuid(
      gallery_item0 : Uuid
    , post0: Uuid 
    , conn: &Conn 
  ) -> Result<usize, diesel::result::Error> {

    use crate::schema::*;

    let g0 = gallery_items::table
             .filter(gallery_items::uuid.eq(gallery_item0.as_bytes().as_ref()))
             .select(gallery_items::id)
             .first::<i32>(conn)?;

    let p0 = posts::table
             .filter(posts::uuid.eq(post0.as_bytes().as_ref()))
             .select(posts::id)
             .first::<i32>(conn)?;

      gallery_item_post_create(g0,p0,conn)
}

pub fn gallery_item_posts_by_id(
      gallery_item0 : i32
    , conn: &Conn 
  ) -> Result<Vec<models::Post>, diesel::result::Error> {

    use crate::schema::*;

    gallery_item_posts::table
        .filter(gallery_items::id.eq(gallery_item0))
        .inner_join(gallery_items::table)
        .inner_join(posts::table)
        .select(posts::all_columns)
        .load(conn)
}

pub fn post_gallery_items_by_id(
      post0 : i32
    , conn: &Conn 
  ) -> Result<Vec<models::GalleryItem>, diesel::result::Error> {

    use crate::schema::*;

    gallery_item_posts::table
        .filter(posts::id.eq(post0))
        .inner_join(posts::table)
        .inner_join(gallery_items::table)
        .select(gallery_items::all_columns)
        .load(conn)
}

pub fn gallery_item_posts_by_uuid(
      gallery_item0 : Uuid
    , conn: &Conn 
  ) -> Result<Vec<models::Post>, diesel::result::Error> {

    use crate::schema::*;

    gallery_item_posts::table
        .filter(gallery_items::uuid.eq(gallery_item0.as_bytes().as_ref()))
        .inner_join(gallery_items::table)
        .inner_join(posts::table)
        .select(posts::all_columns)
        .load(conn)
}

pub fn post_gallery_items_by_uuid(
      post0 : Uuid
    , conn: &Conn 
  ) -> Result<Vec<models::GalleryItem>, diesel::result::Error> {

    use crate::schema::*;

    gallery_item_posts::table
        .filter(posts::uuid.eq(post0.as_bytes().as_ref()))
        .inner_join(posts::table)
        .inner_join(gallery_items::table)
        .select(gallery_items::all_columns)
        .load(conn)
}


