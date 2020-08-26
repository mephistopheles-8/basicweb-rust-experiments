
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

pub fn user_gallery_by_id(
      id0 : i32
    , conn: &Connection0
  ) -> Result<Option<(models::UserGallery,models::Gallery)>, diesel::result::Error> {
    
    use crate::schema::*;

    user_galleries::table
        .filter(user_galleries::id.eq(id0))
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

pub fn user_gallery_by_url(
      handle0: &str
    , url0 : &str
    , conn: &Connection0
  ) -> Result<Option<(models::UserGallery,models::Gallery)>, diesel::result::Error> {
    
    use crate::schema::*;

    user_galleries::table
        .filter(user_galleries::url.eq(url0).and(users::handle.eq(handle0)))
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
        .order_by(user_galleries::ord)
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
        .order_by(user_galleries::ord)
        .load(conn)
}

pub fn user_galleries_by_user_handle(
      handle0 : &str
    , conn: &Connection0
  ) -> Result<Vec<(models::UserGallery,models::Gallery)>, diesel::result::Error> {
    
    use crate::schema::*;

    user_galleries::table
        .filter(users::handle.eq(handle0))
        .inner_join(users::table)
        .inner_join(galleries::table)
        .select((user_galleries::all_columns, galleries::all_columns))
        .order_by(user_galleries::ord)
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


