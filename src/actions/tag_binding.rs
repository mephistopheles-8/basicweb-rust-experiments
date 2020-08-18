
use diesel::prelude::*;
use crate::db::Connection;
use crate::models;


pub fn tag_binding_create( 
        kind0: i32, item_id0: i32, tag0: i32, conn: &Connection 
    ) -> Result<usize, diesel::result::Error> {

    use crate::schema::tag_bindings::dsl::*;

    let new_tag_binding = models::NewTagBinding {
        kind : kind0
     ,  item_id : item_id0
     ,  tag : tag0
    };

    diesel::insert_into(tag_bindings).values(&new_tag_binding).execute(conn)
}

pub fn tag_binding_delete_by_id ( id0: i32, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::tag_bindings::dsl::*;
    diesel::delete(tag_bindings.filter(id.eq(id0))).execute(conn)
}

pub fn tag_binding_delete_by_tag ( kind0: i32, item_id0: i32, tag0: i32, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::tag_bindings::dsl::*;
    diesel::delete(tag_bindings.filter(
            kind.eq(kind0).and(item_id.eq(item_id0)).and(tag.eq(tag0)) 
            )).execute(conn)
}

