
use diesel::prelude::*;
use uuid::Uuid;
use crate::models;
use crate::db::Connection as Connection0;

pub fn gallery_item_create( 
      name0 : &str
    , description0: &str
    , kind0: i32
    , gallery0: i32
    , resource0 : i32 
    , conn: &Connection0 
  ) -> Result<Uuid, diesel::result::Error> {

   use crate::schema::gallery_items::dsl::*;

   let uuid0 = Uuid::new_v4();

   let new_gallery_item = 
       models::GalleryItemNew {
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

pub fn gallery_items_by_gallery_id ( gallery_id: i32, conn: &Connection0 ) 
    -> Result<Vec<(i32, String, models::GalleryItem)>, diesel::result::Error> {

    use crate::schema::*;

    let g0s = gallery_items::table
              .filter(gallery_items::gallery.eq(gallery_id))
              .inner_join(resources::table)
              .select((resources::kind,resources::mime,gallery_items::all_columns))
              .load( conn )?; 
    Ok(g0s)
}

pub fn gallery_items_by_gallery_uuid ( gallery_uuid: Uuid, conn: &Connection0 ) 
    -> Result<Vec<(i32, String, models::GalleryItem)>, diesel::result::Error> {

    use crate::schema::*;

    let g0s = gallery_items::table
              .filter(
                  galleries::uuid.eq(gallery_uuid.as_bytes().as_ref())
                  .and(gallery_items::gallery.eq(galleries::id))
              )
              .inner_join(galleries::table)
              .inner_join(resources::table)
              .select((resources::kind,resources::mime,gallery_items::all_columns))
              .load( conn )?; 
    Ok(g0s)
}



pub fn gallery_item_by_id ( id0: i32, conn: &Connection0 ) 
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

pub fn gallery_item_by_id0 ( id0: i32, gallery0: i32, conn: &Connection0 ) 
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

pub fn gallery_item_by_uuid ( uuid0: Uuid, conn: &Connection0 ) 
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

pub fn gallery_item_by_uuid0 ( uuid0: Uuid, gallery_uuid: Uuid, conn: &Connection0 ) 
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
