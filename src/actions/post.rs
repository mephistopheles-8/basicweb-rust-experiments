use diesel::prelude::*;
use uuid::Uuid;
use crate::models;
use crate::db::Connection;

pub fn post_create( 
        post0: &models::PostPost, conn: &Connection 
    ) -> Result<Uuid, diesel::result::Error> {

    use crate::schema::posts::dsl::*;

    let uuid0 = Uuid::new_v4();

    let new_post = models::NewPost {
        parent: None,
        depth: 0,
        title: post0.title.as_deref(),
        description: post0.description.as_deref(),
        body: &post0.body,
        status: 0,
        uuid: uuid0.as_bytes(),
    };

    diesel::insert_into(posts).values(&new_post).execute(conn)?;
    Ok(uuid0)
}

pub fn post_reply_create(
      parent0: &models::Post
    , post0: &models::PostPost
    , conn: &Connection 
    ) -> Result<Uuid, diesel::result::Error> {

    use crate::schema::posts::dsl::*;

    let uuid0 = Uuid::new_v4();

    let new_post = models::NewPost {
        parent: Some(parent0.id),
        depth: parent0.depth + 1,
        title: post0.title.as_deref(),
        description: post0.description.as_deref(),
        body: &post0.body,
        status: 0,
        uuid: uuid0.as_bytes(),
    };

    diesel::insert_into(posts).values(&new_post).execute(conn)?;
    Ok(uuid0)
}

pub fn posts_all ( conn: &Connection ) 
    -> Result<Vec<models::Post>, diesel::result::Error> {

    use crate::schema::posts::dsl::*;
    let g0s = 
        posts.filter(status.eq(0))
            .order_by(created.desc())
            .load( conn )?;
    Ok(g0s)
}

pub fn posts_all_paginated ( n: i64, page: i64, conn: &Connection ) 
    -> Result<Vec<models::Post>, diesel::result::Error> {

    use crate::schema::posts::dsl::*;
    let g0s = 
        posts.filter(status.eq(0))
            .order_by(created.desc())
            .limit(n)
            .offset(n*page)
            .load( conn )?;
    Ok(g0s)
}

pub fn posts_root ( n: i64, page: i64, conn: &Connection ) 
    -> Result<Vec<models::Post>, diesel::result::Error> {

    use crate::schema::posts::dsl::*;
    let g0s = 
        posts.filter(parent.is_null().and(status.eq(0)))
            .order_by(created.desc())
            .limit(n)
            .offset(n*page)
            .load( conn )?;
    Ok(g0s)
}

pub fn post_replies ( pid0: i32, n: i64, page: i64, conn: &Connection ) 
    -> Result<Vec<models::Post>, diesel::result::Error> {

    use crate::schema::posts::dsl::*;
    let g0s = 
        posts.filter(parent.eq(pid0))
            .order_by(created.asc())
            .limit(n)
            .offset(n*page)
            .load( conn )?;
    Ok(g0s)
}

pub fn post_thread ( pid0: i32, max_depth: i64, conn: &Connection ) 
    -> Result<Option<models::PostTree>, diesel::result::Error> {

    use models::PostTree;

    let g0s =
        diesel::sql_query(format!("
        WITH RECURSIVE
          posts_in_thread(p,d) AS (
            VALUES({},1)
            UNION ALL
            SELECT id, d + 1 FROM posts, posts_in_thread
             WHERE posts.parent=posts_in_thread.p
               AND d <= {}
          )
        SELECT posts.* FROM posts, posts_in_thread
         WHERE posts.id = posts_in_thread.p
         ORDER BY depth, created DESC
        ", pid0, max_depth)).load(conn)?;
    
    let mut g1s 
        = g0s
        .into_iter()
        .map(|post| PostTree::from_post(post) )  
        .collect::<Vec<PostTree>>();

    let mut p0 = None;

    // TODO: Make sure this is correct...
    // the ordering should make it so

    while let Some(post) = g1s.pop() {
        if post.id == pid0 {
            p0 = Some(post);
            break;
        }else {
            if let Some(pid1) = post.parent {
                for i in 0..g1s.len() {
                    if g1s[i].id == pid1 {
                        g1s[i].replies.push(post);
                        break;
                    }
                }
            }
        }
    }

    Ok(p0)
}

pub fn post_thread_full ( pid0: i32, conn: &Connection ) 
    -> Result<Option<models::PostTree>, diesel::result::Error> {

    use models::PostTree;

    let g0s =
        diesel::sql_query(format!("
        WITH RECURSIVE
          posts_in_thread(p) AS (
            VALUES({})
            UNION ALL
            SELECT id FROM posts, posts_in_thread
             WHERE posts.parent=posts_in_thread.p
          )
        SELECT posts.* FROM posts, posts_in_thread
         WHERE posts.id = posts_in_thread.p
         ORDER BY depth, created DESC
        ", pid0)).load(conn)?;

    let mut g1s 
        = g0s
        .into_iter()
        .map(|post| PostTree::from_post(post) )  
        .collect::<Vec<PostTree>>();

    let mut p0 = None;

    // TODO: Make sure this is correct...
    // the ordering should make it so

    while let Some(post) = g1s.pop() {
        if post.id == pid0 {
            p0 = Some(post);
            break;
        }else {
            if let Some(pid1) = post.parent {
                for i in 0..g1s.len() {
                    if g1s[i].id == pid1 {
                        g1s[i].replies.push(post);
                        break;
                    }
                }
            }
        }
    }

    Ok(p0)
}

pub fn post_by_id ( id0: i32, conn: &Connection ) 
    -> Result<Option<models::Post>, diesel::result::Error> {

    use crate::schema::posts::dsl::*;
    let g0s = posts
             .filter(id.eq(id0))
             .first::<models::Post>( conn )
             .optional()?; 
    Ok(g0s)
}

pub fn post_by_uuid ( uuid0: Uuid, conn: &Connection ) 
    -> Result<Option<models::Post>, diesel::result::Error> {

    use crate::schema::posts::dsl::*;
    let g0s = posts
              .filter(uuid.eq(uuid0.as_bytes().as_ref()))
              .first::<models::Post>( conn )
              .optional()?; 
    Ok(g0s)
}

pub fn post_delete_by_id ( id0: i32, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::posts::dsl::*;
    diesel::delete(posts.filter(id.eq(id0))).execute(conn)
}

pub fn post_delete_by_uuid ( uuid0: Uuid, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::posts::dsl::*;
    diesel::delete(posts.filter(uuid.eq(uuid0.as_bytes().as_ref()))).execute(conn)
}

pub fn post_update_by_id( 
        data: &models::PostPost, id0: i32, conn: &Connection 
    ) -> Result<usize, diesel::result::Error> {

    use crate::schema::posts::dsl::*;

    diesel::update(posts.filter(id.eq(id0))).set(data).execute(conn)
}

pub fn post_update_by_uuid( 
        data: &models::PostPost, uuid0: Uuid, conn: &Connection 
    ) -> Result<usize, diesel::result::Error> {

    use crate::schema::posts::dsl::*;

    diesel::update(posts.filter(uuid.eq(uuid0.as_bytes().as_ref()))).set(data).execute(conn)
}

pub fn post_update_title_by_id ( title0: Option<&str>, id0: i32, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::posts::dsl::*;
    diesel::update(posts.filter(id.eq(id0))).set(title.eq(title0)).execute(conn)
}

pub fn post_update_description_by_id ( description0: Option<&str>, id0: i32, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::posts::dsl::*;
    diesel::update(posts.filter(id.eq(id0))).set(description.eq(description0)).execute(conn)
}

pub fn post_update_body_by_id ( body0: &str, id0: i32, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::posts::dsl::*;
    diesel::update(posts.filter(id.eq(id0))).set(body.eq(body0)).execute(conn)
}

