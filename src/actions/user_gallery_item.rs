
use diesel::prelude::*;
use crate::models;
use crate::actions;
use crate::db::Connection as Connection0;
use uuid::Uuid;

pub fn user_gallery_item_create(
      user0 : i32
    , gallery_item0: i32 
    , data : &models::UserGalleryItemPost
    , conn: &Connection0 
  ) -> Result<usize, diesel::result::Error> {
    use crate::schema::user_gallery_items::dsl::*;

    let new_user_gallery_item = models::NewUserGalleryItem {
        user : user0
     ,  gallery_item: gallery_item0
     ,  permissions: data.permissions
     ,  ord: data.ord
     ,  url: data.url.as_deref()
    };

    diesel::insert_into(user_gallery_items).values(&new_user_gallery_item).execute(conn)
}


pub fn user_gallery_item_create_uuid(
      user0 : Uuid
    , gallery_item0: Uuid
    , data : &models::UserGalleryItemPost
    , conn: &Connection0
  ) -> Result<usize, diesel::result::Error> {
    
    use crate::schema::*;

    let uid
        = users::table
            .filter(users::uuid.eq(user0.as_bytes().as_ref()))
            .select(users::id)
            .first::<i32>(conn)?;
    let gid 
        = gallery_items::table
            .filter(gallery_items::uuid.eq(gallery_item0.as_bytes().as_ref()))
            .select(gallery_items::id)
            .first::<i32>(conn)?;

    user_gallery_item_create(uid,gid,data,conn)
}


pub fn user_gallery_item_resource_create_uuid(
      user0: Uuid
    , name0 : &str
    , description0: &str
    , kinds: (i32,i32)
    , filepath0 : &str 
    , mime0 : &str 
    , gallery0: Uuid
    , ugi : &models::UserGalleryItemPost
    , conn: &Connection0 
  ) -> Result<(Uuid,Uuid), diesel::result::Error> {

   use crate::schema::resources::dsl::*;

   conn.transaction(|| {
        let res_uuid 
            = actions::resource::resource_create(filepath0,mime0,kinds.1,conn)?;
    
        let res = resources
                  .filter(uuid.eq(res_uuid.as_bytes().as_ref()))
                  .first::<models::Resource>(conn)?; 
        
        let gallery = actions::gallery::gallery_by_uuid(gallery0, conn)?.unwrap(); 

        let gi_uuid = actions::gallery_item::gallery_item_create(name0,description0,kinds.0,gallery.id, res.id, conn)?;

        user_gallery_item_create_uuid(user0,gi_uuid,ugi,conn)?;

        Ok((res_uuid, gi_uuid))
    })
}

pub fn user_gallery_item_by_url (
    handle0: &str
  , gallery_url0: &str
  , item_url0: &str
  , conn: &Connection0 
  ) -> Result<Option<(i32, String, models::GalleryItem, models::UserGalleryItem)>, diesel::result::Error> {

    use crate::schema::*;

    user_gallery_items::table
          .filter(users::handle.eq(handle0)
              .and(user_gallery_items::url.eq(item_url0))
            )
          .inner_join(users::table)
          .inner_join(gallery_items::table
              .inner_join(galleries::table)
              .inner_join(resources::table)
          )
          .inner_join(user_galleries::table.on(
               user_galleries::url.eq(gallery_url0)
               .and(users::id.eq(user_galleries::user))
               .and(galleries::id.eq(user_galleries::gallery))
            ))
          .select(( resources::kind, resources::mime, gallery_items::all_columns,user_gallery_items::all_columns))
          .first( conn )
          .optional() 
}

pub fn user_gallery_item_by_url0 (
    handle0: &str
  , gallery_url0: &str
  , item_url0: &str
  , conn: &Connection0 
  ) -> Result<Option<(models::Resource, models::GalleryItem, models::UserGalleryItem)>, diesel::result::Error> {

    use crate::schema::*;

    user_gallery_items::table
          .filter(users::handle.eq(handle0)
              .and(user_gallery_items::url.eq(item_url0))
            )
          .inner_join(users::table)
          .inner_join(gallery_items::table
              .inner_join(galleries::table)
              .inner_join(resources::table)
          )
          .inner_join(user_galleries::table.on(
               user_galleries::url.eq(gallery_url0)
               .and(users::id.eq(user_galleries::user))
               .and(galleries::id.eq(user_galleries::gallery))
            ))
          .select((resources::all_columns,gallery_items::all_columns,user_gallery_items::all_columns))
          .first( conn )
          .optional() 
}

pub fn user_gallery_item_by_uuid (
    uuid0: Uuid
  , conn: &Connection0 
  ) -> Result<Option<(i32, String, models::GalleryItem, models::UserGalleryItem)>, diesel::result::Error> {

    use crate::schema::*;

    user_gallery_items::table
          .filter(gallery_items::uuid.eq(uuid0.as_bytes().as_ref()))
          .inner_join(gallery_items::table
              .inner_join(galleries::table)
              .inner_join(resources::table)
          )
          .select((resources::kind,resources::mime,gallery_items::all_columns,user_gallery_items::all_columns))
          .first( conn )
          .optional() 
}


pub fn user_gallery_items_by_gallery_uuid ( gallery_uuid: Uuid, conn: &Connection0 ) 
    -> Result<Vec<(i32, String, models::GalleryItem, models::UserGalleryItem)>, diesel::result::Error> {

    use crate::schema::*;

    let g0s = gallery_items::table
              .filter(
                  galleries::uuid.eq(gallery_uuid.as_bytes().as_ref())
              )
              .inner_join(galleries::table)
              .inner_join(resources::table)
              .inner_join(user_gallery_items::table)
              .select((resources::kind,resources::mime,gallery_items::all_columns,user_gallery_items::all_columns))
              .load( conn )?; 
    Ok(g0s)
}


pub fn user_gallery_items_by_url ( handle0: &str, gallery_url: &str, conn: &Connection0 ) 
    -> Result<Vec<(i32, String, models::GalleryItem, models::UserGalleryItem)>, diesel::result::Error> {

    use crate::schema::*;
    let g0s = user_gallery_items::table
              .filter(
                  user_gallery_items::url.eq(gallery_url)
                  .and(users::handle.eq(handle0))
              )
              .inner_join( users::table )
              .inner_join(
                   gallery_items::table
                      .inner_join(resources::table)
                      .inner_join(galleries::table)
                  )
              .select((resources::kind,resources::mime,gallery_items::all_columns,user_gallery_items::all_columns))
              .load( conn )?; 

    Ok(g0s)
}


