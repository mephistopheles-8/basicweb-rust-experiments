// Utilities for querying tags belonging to a user

use diesel::prelude::*;
use crate::models;
use crate::actions;
use crate::db::Connection as Conn;
use uuid::Uuid;

pub fn user_tags_public(
      conn: &Conn 
) -> Result<Vec<models::Tag>, diesel::result::Error> {

    diesel::sql_query("
    SELECT DISTINCT x.* FROM (
        SELECT t.*
        FROM tags t
        JOIN gallery_tags gt 
          ON gt.tag = t.id
        JOIN user_galleries ug 
          ON ug.gallery     = gt.gallery
         AND ug.permissions = 1

        UNION
        
        SELECT t.*
        FROM tags t
        JOIN gallery_item_tags git 
          ON git.tag = t.id
        JOIN user_gallery_items ugi 
          ON ugi.gallery_item = git.gallery_item
         AND ugi.permissions  = 1

        UNION

        SELECT t.*
        FROM tags t
        JOIN post_tags pt 
          ON pt.tag = t.id
        JOIN user_posts up 
          ON up.post        = pt.post
         AND up.permissions = 1
    ) x
    ORDER BY x.name;
    ")
    .load(conn)
}

pub fn user_tags_public_by_handle(
      handle0 : &str
    , conn: &Conn 
) -> Result<Vec<models::Tag>, diesel::result::Error> {

    let user 
        = actions::user::user_by_handle(handle0,conn)?
          .ok_or_else(|| diesel::result::Error::NotFound)?;

    diesel::sql_query("
    SELECT DISTINCT x.* FROM (
        SELECT t.*
        FROM tags t
        JOIN gallery_tags gt 
          ON gt.tag = t.id
        JOIN user_galleries ug 
          ON ug.gallery     = gt.gallery
         AND ug.user        = ?1
         AND ug.permissions = 1

        UNION
        
        SELECT t.*
        FROM tags t
        JOIN gallery_item_tags git 
          ON git.tag = t.id
        JOIN user_gallery_items ugi 
          ON ugi.gallery_item = git.gallery_item
         AND ugi.user         = ?1
         AND ugi.permissions  = 1

        UNION

        SELECT t.*
        FROM tags t
        JOIN post_tags pt 
          ON pt.tag = t.id
        JOIN user_posts up 
          ON up.post        = pt.post
         AND up.user        = ?1
         AND up.permissions = 1
    ) x
    ORDER BY x.name;
    ")
    .bind::<diesel::sql_types::Integer,_>(user.id)
    .load(conn)
}

pub fn user_tags_all_by_uuid(
      uuid0 : Uuid
    , conn: &Conn 
) -> Result<Vec<models::Tag>, diesel::result::Error> {

    let user 
        = actions::user::user_by_uuid(uuid0,conn)?
          .ok_or_else(|| diesel::result::Error::NotFound)?;

    diesel::sql_query("
    SELECT DISTINCT x.* FROM (
        SELECT t.*
        FROM tags t
        JOIN gallery_tags gt 
          ON gt.tag = t.id
        JOIN user_galleries ug 
          ON ug.gallery     = gt.gallery
         AND ug.user        = ?1

        UNION
        
        SELECT t.*
        FROM tags t
        JOIN gallery_item_tags git 
          ON git.tag = t.id
        JOIN user_gallery_items ugi 
          ON ugi.gallery_item = git.gallery_item
         AND ugi.user         = ?1

        UNION

        SELECT t.*
        FROM tags t
        JOIN post_tags pt 
          ON pt.tag = t.id
        JOIN user_posts up 
          ON up.post        = pt.post
         AND up.user        = ?1
    ) x
    ORDER BY x.name;
    ")
    .bind::<diesel::sql_types::Integer,_>(user.id)
    .load(conn)
}
