
use diesel::prelude::*;
use crate::db::Connection;
use crate::models;


pub fn tag_create( 
        tag0: &models::TagPost, conn: &Connection 
    ) -> Result<usize, diesel::result::Error> {

    use crate::schema::tags::dsl::*;

    let new_tag = models::NewTag {
        name: &tag0.name,
    };

    diesel::insert_into(tags).values(&new_tag).execute(conn)
}

pub fn tags_all ( conn: &Connection ) 
    -> Result<Vec<models::Tag>, diesel::result::Error> {

    use crate::schema::tags::dsl::*;
    let g0s = tags.order_by(name).load( conn )?; 
    Ok(g0s)
}

pub fn tag_by_id ( id0: i32, conn: &Connection ) 
    -> Result<Option<models::Tag>, diesel::result::Error> {

    use crate::schema::tags::dsl::*;
    let g0s = tags
             .filter(id.eq(id0))
             .first::<models::Tag>( conn )
             .optional()?; 
    Ok(g0s)
}

pub fn tag_by_name ( name0: &str, conn: &Connection ) 
    -> Result<Option<models::Tag>, diesel::result::Error> {

    use crate::schema::tags::dsl::*;
    let g0s = tags
             .filter(name.eq(name0))
             .first::<models::Tag>( conn )
             .optional()?; 
    Ok(g0s)
}

pub fn tag_delete_by_id ( id0: i32, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::tags::dsl::*;
    diesel::delete(tags.filter(id.eq(id0))).execute(conn)
}

pub fn tag_delete_by_name ( name0: &str, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::tags::dsl::*;
    diesel::delete(tags.filter(name.eq(name0))).execute(conn)
}


