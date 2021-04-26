
use diesel::prelude::*;
use crate::models;
use crate::actions;
use crate::db::Connection as Connection0;
use uuid::Uuid;

pub fn user_gallery_create(
      user0 : i32
    , gallery0: i32 
    , data : &models::UserGalleryUpd
    , conn: &Connection0 
  ) -> Result<usize, diesel::result::Error> {
    use crate::schema::user_galleries::dsl::*;

    let new_user_gallery = models::UserGalleryNew {
        user : user0
     ,  gallery: gallery0
     ,  permissions: data.permissions
     ,  ord: data.ord
     ,  url: data.url.as_deref()
    };

    diesel::insert_into(user_galleries).values(&new_user_gallery).execute(conn)
}

pub fn user_gallery_create0(
      user0 : i32
    , data0 : &models::GalleryUpd
    , data1 : &models::UserGalleryUpd
    , conn: &Connection0
  ) -> Result<Uuid, diesel::result::Error> {
    
    use crate::schema::*;
    let uuid0 = 
        conn.transaction(|| {
            let uuid0 = actions::gallery::gallery_create(data0,conn)?;

            let gid = galleries::table
                    .filter(galleries::uuid.eq(uuid0.as_bytes().as_ref()))
                    .select(galleries::id)
                    .first::<i32>(conn)?;

            user_gallery_create(user0, gid, data1, conn)?;
            Ok::<_,diesel::result::Error>(uuid0)
        })?;

    Ok(uuid0)
}

pub fn user_gallery_create0_uuid(
      user0 : Uuid
    , data0 : &models::GalleryUpd
    , data1 : &models::UserGalleryUpd
    , conn: &Connection0
  ) -> Result<Uuid, diesel::result::Error> {
    
    use crate::schema::*;
    let uuid0 = 
        conn.transaction(|| {

            let uid 
                = users::table
                    .filter(users::uuid.eq(user0.as_bytes().as_ref()))
                    .select(users::id)
                    .first::<i32>(conn)?;

            let uuid0 = actions::gallery::gallery_create(data0,conn)?;

            let gid = galleries::table
                    .filter(galleries::uuid.eq(uuid0.as_bytes().as_ref()))
                    .select(galleries::id)
                    .first::<i32>(conn)?;

            user_gallery_create(uid, gid, data1, conn)?;
            Ok::<_,diesel::result::Error>(uuid0)
        })?;

    Ok(uuid0)
}

// NOTE: Galleries only have one owner.  Therefore, we can key by gallery uuid (there won't
// be multiple user_gallery records).
// NOTE: Shallow deletion; cleanup orphans with another process.  This will delete associated
// user_gallery_items, however.  The gallery record will exist as an orphan, and could be
// used for resource cleanup.

pub fn user_gallery_delete_by_id(
      gallery0: i32
    , conn: &Connection0
  ) -> Result<(), diesel::result::Error> {
    
    use crate::schema::*;

    conn.transaction(|| {
        diesel::delete(
            user_galleries::table
            .filter(user_galleries::gallery.eq(gallery0))
        ).execute(conn)?;

        diesel::delete(
            user_gallery_items::table
            .filter(user_gallery_items::gallery_item.eq_any(
                gallery_items::table
                .filter(gallery_items::gallery.eq(gallery0))
                .select(gallery_items::id)
            ))
        ).execute(conn)?;

        Ok(())
    })
}

pub fn user_gallery_delete_by_uuid(
      gallery0: Uuid
    , conn: &Connection0
  ) -> Result<bool, diesel::result::Error> {
    
    use crate::schema::*;
    conn.transaction(|| {
        let g0 
            = actions::gallery::gallery_by_uuid(gallery0,conn)?;
        if let Some(g0) = g0 {

            diesel::delete(
                user_galleries::table
                .filter(user_galleries::gallery.eq(g0.id))
            ).execute(conn)?;
            
            diesel::delete(
                user_gallery_items::table
                .filter(user_gallery_items::gallery_item.eq_any(
                    gallery_items::table
                    .filter(gallery_items::gallery.eq(g0.id))
                    .select(gallery_items::id)
                ))
            ).execute(conn)?;
            
            Ok(true)
        }else{
            Ok(false)
        }
    })
}


// NOTE: Galleries only have one owner.  Therefore, we can key by gallery uuid (there won't
// be multiple user_gallery records)
pub fn user_gallery_update_by_uuid(
      gallery0: Uuid
    , data0 : &models::GalleryUpd
    , data1 : &models::UserGalleryUpd
    , conn: &Connection0
  ) -> Result<Option<(models::UserGallery,models::Gallery)>, diesel::result::Error> {
    
    use crate::schema::*;
    conn.transaction(|| {
        let g0 = actions::gallery::gallery_by_uuid(gallery0,conn)?;
        if let Some(g0) = g0 {
            actions::gallery::gallery_update_by_uuid(gallery0,data0,conn)?;
            diesel::update(
                user_galleries::table
                .filter(user_galleries::gallery.eq(g0.id))
            ).set(data1).execute(conn)?;
        }
        user_gallery_by_uuid(gallery0, conn)    
    })
}

// Update ord
// FIXME: diesel joins?

pub fn user_gallery_ord(
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
            let g0 = actions::gallery::gallery_by_uuid(ord.uuid,conn)?
                     .ok_or_else(|| diesel::result::Error::NotFound)?;

            diesel::update(
                user_galleries::table
                .filter(
                    user_galleries::gallery.eq(g0.id)
                    .and(user_galleries::user.eq(user.id))
                    )
            ).set(user_galleries::ord.eq(ord.ord)).execute(conn)?;
        }
        Ok(())
    })
}

pub fn user_gallery_by_id(
      id0 : i32
    , conn: &Connection0
  ) -> Result<Option<(models::UserGallery,models::Gallery)>, diesel::result::Error> {
    
    use crate::schema::*;

    user_galleries::table
        .filter(galleries::id.eq(id0))
        .inner_join(galleries::table)
        .first(conn)
        .optional()
}

pub fn user_gallery_by_uuid(
      uuid0 : Uuid
    , conn: &Connection0
  ) -> Result<Option<(models::UserGallery,models::Gallery)>, diesel::result::Error> {
    
    use crate::schema::*;

    user_galleries::table
        .filter(galleries::uuid.eq(uuid0.as_bytes().as_ref()))
        .inner_join(galleries::table)
        .first(conn)
        .optional()
}

pub fn user_owned_gallery_by_uuid(
      uid0 : Uuid
    , gid0 : Uuid
    , conn: &Connection0
  ) -> Result<Option<(models::UserGallery,models::Gallery)>, diesel::result::Error> {
    
    use crate::schema::*;

    user_galleries::table
        .inner_join(users::table)
        .inner_join(galleries::table)
        .filter(
            galleries::uuid.eq(gid0.as_bytes().as_ref())
            .and(users::uuid.eq(uid0.as_bytes().as_ref())) 
         )
        .select((user_galleries::all_columns,galleries::all_columns))
        .first(conn)
        .optional()
}


pub fn user_gallery_by_url(
      handle0: &str
    , url0 : &str
    , conn: &Connection0
  ) -> Result<Option<(models::UserGallery,models::Gallery)>, diesel::result::Error> {
    
    use crate::schema::*;

    user_galleries::table
        .filter(
            user_galleries::url.eq(url0)
            .and(user_galleries::permissions.eq(1))
            .and(users::handle.eq(handle0))
        )
        .inner_join(users::table)
        .inner_join(galleries::table)
        .select((user_galleries::all_columns,galleries::all_columns))
        .first(conn)
        .optional()
}

pub fn user_galleries_by_user_id(
      uid : i32
    , conn: &Connection0
  ) -> Result<Vec<(models::UserGallery,models::Gallery)>, diesel::result::Error> {
    
    use crate::schema::*;

    user_galleries::table
        .filter(user_galleries::user.eq(uid))
        .inner_join(galleries::table)
        .order_by((user_galleries::ord,galleries::created.desc()))
        .load(conn)
}

pub fn user_galleries_by_user_uuid(
      uuid0 : Uuid
    , conn: &Connection0
  ) -> Result<Vec<(models::UserGallery,models::Gallery)>, diesel::result::Error> {
    
    use crate::schema::*;

    user_galleries::table
        .filter(users::uuid.eq(uuid0.as_bytes().as_ref()))
        .inner_join(users::table)
        .inner_join(galleries::table)
        .select((user_galleries::all_columns, galleries::all_columns))
        .order_by((user_galleries::ord,galleries::created.desc()))
        .load(conn)
}

pub fn user_galleries_by_user_handle(
      handle0 : &str
    , conn: &Connection0
  ) -> Result<Vec<(models::UserGallery,models::Gallery)>, diesel::result::Error> {
    
    use crate::schema::*;

    user_galleries::table
        .filter(
            user_galleries::permissions.eq(1)
            .and(users::handle.eq(handle0))
        )
        .inner_join(users::table)
        .inner_join(galleries::table)
        .select((user_galleries::all_columns, galleries::all_columns))
        .order_by((user_galleries::ord,galleries::created.desc()))
        .load(conn)
}


pub fn user_owns_gallery(
      user0 : Uuid
    , gallery0 : Uuid
    , conn: &Connection0
  ) -> Result<bool, diesel::result::Error> {
    use diesel::dsl::*; 
    use crate::schema::*;

    select(exists(user_galleries::table
        .inner_join(galleries::table)
        .inner_join(users::table)
        .filter(
            users::uuid.eq(user0.as_bytes().as_ref())
            .and(galleries::uuid.eq(gallery0.as_bytes().as_ref()))
        ))
    ).get_result(conn)
}


pub fn user_gallery_url_exists(
     user0: Uuid
   , url0 : &str
   , conn: &Connection0
) -> Result<bool, diesel::result::Error> {

    use diesel::dsl::*; 
    use crate::schema::*;

    select(exists(user_galleries::table
        .inner_join(users::table)
        .filter(
            users::uuid.eq(user0.as_bytes().as_ref())
            .and(user_galleries::url.eq(url0))
        ))
    ).first(conn)

}

pub fn user_galleries_public_by_tag(
      tag0 : &str
    , conn: &Connection0
  ) -> Result<Vec<(models::UserGallery,models::Gallery)>, diesel::result::Error> {
    
    use crate::schema::*;

    user_galleries::table
        .inner_join(
            galleries::table
            .inner_join(
                gallery_tags::table
                .inner_join(tags::table)
            )
        )
        .filter(
            user_galleries::permissions.eq(1)
            .and(tags::name.eq(tag0))
         )
        .select((user_galleries::all_columns, galleries::all_columns))
        .order_by(galleries::created.desc())
        .load(conn)
}

pub fn user_galleries_public_by_handle_tag(
      handle0 : &str
    , tag0 : &str
    , conn: &Connection0
  ) -> Result<Vec<(models::UserGallery,models::Gallery)>, diesel::result::Error> {
    
    use crate::schema::*;

    user_galleries::table
        .inner_join(users::table)
        .inner_join(
            galleries::table
            .inner_join(
                gallery_tags::table
                .inner_join(tags::table)
            )
        )
        .filter(
            user_galleries::permissions.eq(1)
            .and(tags::name.eq(tag0))
            .and(users::handle.eq(handle0))
         )
        .select((user_galleries::all_columns, galleries::all_columns))
        .order_by((user_galleries::ord,galleries::created.desc()))
        .load(conn)
}



pub fn user_galleries_all_by_tag(
      user0: Uuid
    , tag0 : &str
    , conn: &Connection0
  ) -> Result<Vec<(models::UserGallery,models::Gallery)>, diesel::result::Error> {
    
    use crate::schema::*;

    user_galleries::table
        .inner_join(users::table)
        .inner_join(
            galleries::table
            .inner_join(
                gallery_tags::table
                .inner_join(tags::table)
            )
        )
        .filter(
            tags::name.eq(tag0)
            .and(users::uuid.eq(user0.as_bytes().as_ref()))
         )
        .select((user_galleries::all_columns, galleries::all_columns))
        .order_by((user_galleries::ord,galleries::created.desc()))
        .load(conn)
}

