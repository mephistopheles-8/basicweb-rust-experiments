
use diesel::prelude::*;
use crate::{models,actions};
use crate::db::Connection as Conn;
use uuid::Uuid;

pub fn user_post_create(
      user0 : i32
    , post0: i32 
    , data : &models::UserPostUpd
    , conn: &Conn 
  ) -> Result<usize, diesel::result::Error> {
    use crate::schema::user_posts::dsl::*;

    let new_user_post = models::UserPostNew {
        user : user0
     ,  post: post0
     ,  permissions: data.permissions
     ,  ord: data.ord
     ,  url: data.url.as_deref()
    };

    diesel::insert_into(user_posts).values(&new_user_post).execute(conn)
}

pub fn user_post_create0(
      user0 : i32
    , data0 : &models::PostUpd
    , data1 : &models::UserPostUpd
    , conn: &Conn
  ) -> Result<Uuid, diesel::result::Error> {
    
    use crate::schema::*;
    let uuid0 = 
        conn.transaction(|| {
            let uuid0 = actions::post::post_create(data0,conn)?;

            let gid = posts::table
                    .filter(posts::uuid.eq(uuid0.as_bytes().as_ref()))
                    .select(posts::id)
                    .first::<i32>(conn)?;

            user_post_create(user0, gid, data1, conn)?;
            Ok::<_,diesel::result::Error>(uuid0)
        })?;

    Ok(uuid0)
}


pub fn user_post_create0_uuid(
      user0 : Uuid
    , data0 : &models::PostUpd
    , data1 : &models::UserPostUpd
    , conn: &Conn
  ) -> Result<Uuid, diesel::result::Error> {
    
    use crate::schema::*;
    let uuid0 = 
        conn.transaction(|| {

            let uid 
                = users::table
                    .filter(users::uuid.eq(user0.as_bytes().as_ref()))
                    .select(users::id)
                    .first::<i32>(conn)?;

            let uuid0 = actions::post::post_create(data0,conn)?;

            let gid = posts::table
                    .filter(posts::uuid.eq(uuid0.as_bytes().as_ref()))
                    .select(posts::id)
                    .first::<i32>(conn)?;

            user_post_create(uid, gid, data1, conn)?;
            Ok::<_,diesel::result::Error>(uuid0)
        })?;

    Ok(uuid0)
}

pub fn user_post_by_id(
      id0 : i32
    , conn: &Conn
  ) -> Result<Option<(models::UserPost,models::Post)>, diesel::result::Error> {
    
    use crate::schema::*;

    user_posts::table
        .filter(user_posts::id.eq(id0))
        .inner_join(posts::table)
        .first(conn)
        .optional()
}

pub fn user_post_by_uuid(
      uuid0 : Uuid
    , conn: &Conn
  ) -> Result<Option<(models::UserPost,models::Post)>, diesel::result::Error> {
    
    use crate::schema::*;

    user_posts::table
        .filter(posts::uuid.eq(uuid0.as_bytes().as_ref()))
        .inner_join(posts::table)
        .first(conn)
        .optional()
}

pub fn user_post_by_url(
      handle0: &str
    , url0 : &str
    , conn: &Conn
  ) -> Result<Option<(models::UserPost,models::Post)>, diesel::result::Error> {
    
    use crate::schema::*;

    user_posts::table
        .filter(user_posts::url.eq(url0).and(users::handle.eq(handle0)))
        .inner_join(users::table)
        .inner_join(posts::table)
        .select((user_posts::all_columns,posts::all_columns))
        .first(conn)
        .optional()
}

pub fn user_posts_by_user_id(
      uid : i32
    , conn: &Conn
  ) -> Result<Vec<(models::UserPost,models::Post)>, diesel::result::Error> {
    
    use crate::schema::*;

    user_posts::table
        .filter(user_posts::user.eq(uid))
        .inner_join(posts::table)
        .order_by(user_posts::ord)
        .load(conn)
}

pub fn user_posts_by_user_uuid(
      uuid0 : Uuid
    , conn: &Conn
  ) -> Result<Vec<(models::UserPost,models::Post)>, diesel::result::Error> {
    
    use crate::schema::*;

    user_posts::table
        .filter(users::uuid.eq(uuid0.as_bytes().as_ref()))
        .inner_join(users::table)
        .inner_join(posts::table)
        .select((user_posts::all_columns, posts::all_columns))
        .order_by(user_posts::ord)
        .load(conn)
}

pub fn user_posts_by_user_handle(
      handle0 : &str
    , conn: &Conn
  ) -> Result<Vec<(models::UserPost,models::Post)>, diesel::result::Error> {
    
    use crate::schema::*;

    user_posts::table
        .filter(users::handle.eq(handle0))
        .inner_join(users::table)
        .inner_join(posts::table)
        .select((user_posts::all_columns, posts::all_columns))
        .order_by(user_posts::ord)
        .load(conn)
}


