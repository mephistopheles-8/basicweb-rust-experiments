
use diesel::prelude::*;
use crate::{models,actions};
use crate::db::Connection as Conn;
use uuid::Uuid;

// Update ord
// FIXME: diesel joins?

pub fn user_post_ord(
     user0: Uuid
   , data0 : &Vec<models::UserPostOrd>
   , conn: &Conn
) -> Result<(), diesel::result::Error> {

    use crate::schema::*;
    conn.transaction(|| {
        let user 
            = actions::user::user_by_uuid(user0,conn)?
             .ok_or_else(|| diesel::result::Error::NotFound)?;

        for ord in data0.iter() {
            let p0 
                = posts::table
                    .filter(
                        posts::uuid.eq(ord.uuid.as_bytes().as_ref())
                    )
                    .first::<models::Post>(conn)?;

            diesel::update(
                user_posts::table
                .filter(
                    user_posts::post.eq(p0.id)
                    .and(user_posts::user.eq(user.id))
                    )
            ).set(user_posts::ord.eq(ord.ord)).execute(conn)?;
        }
        Ok(())
    })
}

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

pub fn user_post_update0_uuid(
      user0 : Uuid
    , post0: Uuid
    , data0 : &models::PostUpd
    , data1 : &models::UserPostUpd
    , conn: &Conn
  ) -> Result<bool, diesel::result::Error> {


    use crate::schema::*;

    conn.transaction(|| {
        if user_owns_post(user0,post0,conn)? {
            let user = actions::user::user_by_uuid(user0,conn)?; 
            let post = actions::post::post_by_uuid(post0,conn)?; 
            if let Some(user) = user {
                if let Some(post) = post {
                    diesel::update(
                       posts::table
                        .filter(
                            posts::id.eq(post.id))
                        
                    ).set(data0)
                     .execute(conn)?;

                    diesel::update(
                       user_posts::table
                        .filter(
                            user_posts::user.eq(user.id)
                            .and(user_posts::post.eq(post.id))
                        )
                    ).set(data1)
                     .execute(conn)?;
                
                    Ok(true)
                }else{
                    Ok(false)
                }
            }else {
                Ok(false)
            }
        }else{
            Ok(false)
        }
    })
}

pub fn user_post_delete_by_id(
      post0: i32
    , conn: &Conn
  ) -> Result<(), diesel::result::Error> {
    
    use crate::schema::*;

    conn.transaction(|| {
        diesel::delete(
            user_posts::table
            .filter(user_posts::post.eq(post0))
        ).execute(conn)?;

        Ok(())
    })
}

pub fn user_post_delete_by_uuid(
      post0: Uuid
    , conn: &Conn
  ) -> Result<bool, diesel::result::Error> {
    
    use crate::schema::*;
    conn.transaction(|| {
        let g0 
            = actions::post::post_by_uuid(post0,conn)?;
        if let Some(g0) = g0 {

            diesel::delete(
                user_posts::table
                .filter(user_posts::post.eq(g0.id))
            ).execute(conn)?;
            
            Ok(true)
        }else{
            Ok(false)
        }
    })
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
        .order_by((user_posts::ord,posts::created.desc()))
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
        .order_by((user_posts::ord,posts::created.desc()))
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
        .order_by((user_posts::ord,posts::created.desc()))
        .load(conn)
}

pub fn user_owns_post(
      user0 : Uuid
    , post0 : Uuid
    , conn: &Conn
  ) -> Result<bool, diesel::result::Error> {
    use diesel::dsl::*; 
    use crate::schema::*;

    select(exists(user_posts::table
        .inner_join(posts::table)
        .inner_join(users::table)
        .filter(
            users::uuid.eq(user0.as_bytes().as_ref())
            .and(posts::uuid.eq(post0.as_bytes().as_ref()))
        ))
    ).get_result(conn)
}



