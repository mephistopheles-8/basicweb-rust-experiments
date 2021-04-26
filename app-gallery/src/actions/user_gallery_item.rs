
use diesel::prelude::*;
use crate::models;
use crate::actions;
use crate::db::Connection as Connection0;
use uuid::Uuid;

// Update ord
// FIXME: diesel joins?

pub fn user_gallery_item_ord(
     user0: Uuid
   , data0 : &Vec<models::UserGalleryOrd>
   , conn: &Connection0
) -> Result<(), diesel::result::Error> {

    use crate::schema::*;
    conn.transaction(|| {
        let user 
            = actions::user::user_by_uuid(user0,conn)?
             .ok_or_else(|| diesel::result::Error::NotFound)?;

        for ord in data0.iter() {
            let gi0 
                = gallery_items::table
                    .filter(
                        gallery_items::uuid.eq(ord.uuid.as_bytes().as_ref())
                    )
                    .first::<models::GalleryItem>(conn)?;

            diesel::update(
                user_gallery_items::table
                .filter(
                    user_gallery_items::gallery_item.eq(gi0.id)
                    .and(user_gallery_items::user.eq(user.id))
                    )
            ).set(user_gallery_items::ord.eq(ord.ord)).execute(conn)?;
        }
        Ok(())
    })
}

pub fn user_gallery_item_create(
      user0 : i32
    , gallery_item0: i32 
    , data : &models::UserGalleryItemUpd
    , conn: &Connection0 
  ) -> Result<usize, diesel::result::Error> {
    use crate::schema::user_gallery_items::dsl::*;

    let new_user_gallery_item = models::UserGalleryItemNew {
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
    , data : &models::UserGalleryItemUpd
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

pub fn user_gallery_item_delete_by_id(
      gallery_item0: i32
    , conn: &Connection0
  ) -> Result<(), diesel::result::Error> {
    
    use crate::schema::*;

    conn.transaction(|| {
        diesel::delete(
            user_gallery_items::table
            .filter(user_gallery_items::gallery_item.eq(gallery_item0))
        ).execute(conn)?;

        Ok(())
    })
}

pub fn user_gallery_item_delete_by_uuid(
      gallery_item0: Uuid
    , conn: &Connection0
  ) -> Result<bool, diesel::result::Error> {
    
    use crate::schema::*;
    conn.transaction(|| {
        let g0 
            = actions::gallery_item::gallery_item_by_uuid(gallery_item0,conn)?;
        if let Some(g0) = g0 {

            diesel::delete(
                user_gallery_items::table
                .filter(user_gallery_items::gallery_item.eq(g0.0.id))
            ).execute(conn)?;
            
            Ok(true)
        }else{
            Ok(false)
        }
    })
}


pub fn user_gallery_item_resource_create_uuid(
      user0: Uuid
    , name0 : &str
    , description0: &str
    , kinds: (i32,i32)
    , filepath0 : &str 
    , mime0 : &str 
    , gallery0: Uuid
    , ugi : &models::UserGalleryItemUpd
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


// NOTE: Galleries only have one owner.
pub fn user_gallery_item_update_by_uuid(
      gallery_item0: Uuid
    , data0 : &models::GalleryItemUpd
    , data1 : &models::UserGalleryItemUpd
    , conn: &Connection0
  ) -> Result<Option<(i32, String, models::GalleryItem,models::UserGalleryItem)>, diesel::result::Error> {
    
    use crate::schema::*;
    conn.transaction(|| {
        let g0 = actions::gallery_item::gallery_item_by_uuid(gallery_item0,conn)?;
        if let Some(g0) = g0 {
            actions::gallery_item::gallery_item_update_by_uuid(gallery_item0,data0,conn)?;
            diesel::update(
                user_gallery_items::table
                .filter(user_gallery_items::gallery_item.eq(g0.0.id))
            ).set(data1).execute(conn)?;
        }
        user_gallery_item_by_uuid(gallery_item0, conn)    
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
              .and(user_gallery_items::permissions.eq(1))
            )
          .inner_join(users::table)
          .inner_join(gallery_items::table
              .inner_join(galleries::table)
              .inner_join(resources::table)
          )
          .inner_join(user_galleries::table.on(
               user_galleries::url.eq(gallery_url0)
               .and(user_galleries::permissions.eq(1))
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
              .and(user_gallery_items::permissions.eq(1))
            )
          .inner_join(users::table)
          .inner_join(gallery_items::table
              .inner_join(galleries::table)
              .inner_join(resources::table)
          )
          .inner_join(user_galleries::table.on(
               user_galleries::url.eq(gallery_url0)
               .and(user_galleries::permissions.eq(1))
               .and(users::id.eq(user_galleries::user))
               .and(galleries::id.eq(user_galleries::gallery))
            ))
          .select((resources::all_columns,gallery_items::all_columns,user_gallery_items::all_columns))
          .first( conn )
          .optional() 
}

pub fn user_gallery_item_by_uuid0 (
    uid0 : Uuid
  , giid0: Uuid
  , conn: &Connection0 
  ) -> Result<Option<(models::Resource, models::GalleryItem, models::UserGalleryItem)>, diesel::result::Error> {

    use crate::schema::*;

    user_gallery_items::table
          .inner_join(gallery_items::table
            .inner_join(resources::table)
          )
          .inner_join(users::table)
          .filter(users::uuid.eq(uid0.as_bytes().as_ref()).and( gallery_items::uuid.eq(giid0.as_bytes().as_ref())))
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
              .order_by((user_gallery_items::ord,gallery_items::created.asc()))
              .load( conn )?; 
    Ok(g0s)
}


pub fn user_gallery_items_by_url ( handle0: &str, gallery_url0: &str, conn: &Connection0 ) 
    -> Result<Vec<(i32, String, models::GalleryItem, models::UserGalleryItem)>, diesel::result::Error> {

    use crate::schema::*;
    user_gallery_items::table
          .filter(users::handle.eq(handle0)
              .and(user_gallery_items::permissions.eq(1))
            )
          .inner_join(users::table)
          .inner_join(gallery_items::table
              .inner_join(galleries::table)
              .inner_join(resources::table)
          )
          .inner_join(user_galleries::table.on(
               user_galleries::url.eq(gallery_url0)
               .and(user_galleries::permissions.eq(1))
               .and(users::id.eq(user_galleries::user))
               .and(galleries::id.eq(user_galleries::gallery))
            ))
          .select(( resources::kind, resources::mime, gallery_items::all_columns,user_gallery_items::all_columns))
          .order_by((user_gallery_items::ord,gallery_items::created.desc()))
          .load( conn )
}


pub fn user_owns_gallery_item(
      user0 : Uuid
    , gallery_item0 : Uuid
    , conn: &Connection0
  ) -> Result<bool, diesel::result::Error> {
    use diesel::dsl::*; 
    use crate::schema::*;

    select(exists(user_gallery_items::table
        .inner_join(gallery_items::table)
        .inner_join(users::table)
        .filter(
            users::uuid.eq(user0.as_bytes().as_ref())
            .and(gallery_items::uuid.eq(gallery_item0.as_bytes().as_ref()))
        ))
    ).get_result(conn)
}


pub fn user_gallery_item_url_exists(
     user0: Uuid
   , url0 : &str
   , conn: &Connection0
) -> Result<bool, diesel::result::Error> {

    use diesel::dsl::*; 
    use crate::schema::*;

    select(exists(user_gallery_items::table
        .inner_join(users::table)
        .filter(
            users::uuid.eq(user0.as_bytes().as_ref())
            .and(user_gallery_items::url.eq(url0))
        ))
    ).first(conn)

}

pub fn user_gallery_items_public_by_tag(
      tag0 : &str
    , conn: &Connection0
  ) -> Result<Vec<(models::UserGalleryItem,models::GalleryItem)>, diesel::result::Error> {
    
    use crate::schema::*;

    user_gallery_items::table
        .inner_join(
            gallery_items::table
            .inner_join(user_galleries::table.on(
                user_galleries::gallery.eq(gallery_items::gallery)
                .and(user_galleries::permissions.eq(1))
            ))
            .inner_join(
                gallery_item_tags::table
                .inner_join(tags::table)
            )
        )
        .filter(
            user_gallery_items::permissions.eq(1)
            .and(tags::name.eq(tag0))
         )
        .select((user_gallery_items::all_columns, gallery_items::all_columns))
        .order_by(gallery_items::created.desc())
        .load(conn)
}

pub fn user_gallery_items_public_by_handle_tag(
      handle0 : &str
    , tag0 : &str
    , conn: &Connection0
  ) -> Result<Vec<(models::UserGalleryItem,models::GalleryItem)>, diesel::result::Error> {
    
    use crate::schema::*;

    user_gallery_items::table
        .inner_join(users::table)
        .inner_join(
            gallery_items::table
            .inner_join(user_galleries::table.on(
                user_galleries::gallery.eq(gallery_items::gallery)
                .and(user_galleries::permissions.eq(1))
            ))
            .inner_join(
                gallery_item_tags::table
                .inner_join(tags::table)
            )
        )
        .filter(
            user_gallery_items::permissions.eq(1)
            .and(tags::name.eq(tag0))
            .and(users::handle.eq(handle0))
         )
        .select((user_gallery_items::all_columns, gallery_items::all_columns))
        .order_by((user_gallery_items::ord,gallery_items::created.desc()))
        .load(conn)
}

pub fn user_gallery_items_all_by_tag(
      user0: Uuid
    , tag0 : &str
    , conn: &Connection0
  ) -> Result<Vec<(models::UserGalleryItem,models::GalleryItem)>, diesel::result::Error> {
    
    use crate::schema::*;
    user_gallery_items::table
        .inner_join(users::table)
        .inner_join(
            gallery_items::table
            .inner_join(
                gallery_item_tags::table
                .inner_join(tags::table)
            )
        )
        .filter(
            tags::name.eq(tag0)
            .and(users::uuid.eq(user0.as_bytes().as_ref()))
         )
        .select((user_gallery_items::all_columns, gallery_items::all_columns))
        .order_by((user_gallery_items::ord,gallery_items::created.desc()))
        .load(conn)

}

