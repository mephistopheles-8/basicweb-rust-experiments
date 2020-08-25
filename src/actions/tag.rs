
use diesel::prelude::*;
use crate::db::{Connection as Conn};
use crate::models;


pub fn tag_create( 
        tag0: &models::TagPost, conn: &Conn 
    ) -> Result<models::Tag, diesel::result::Error> {

    use crate::schema::tags::dsl::*;

    let new_tag = models::NewTag {
        name: &tag0.name,
    };

    diesel::insert_into(tags).values(&new_tag).execute(conn)?;

    tags
     .filter(name.eq(&tag0.name))
     .first::<models::Tag>( conn )
}

pub fn tag_create_by_value( 
        tag0: &str, conn: &Conn 
    ) -> Result<models::Tag, diesel::result::Error> {

    use crate::schema::tags::dsl::*;

    diesel::insert_into(tags).values(name.eq(tag0)).execute(conn)?;

    tags
     .filter(name.eq(tag0))
     .first::<models::Tag>( conn )
}

pub fn tags_all ( conn: &Conn ) 
    -> Result<Vec<models::Tag>, diesel::result::Error> {

    use crate::schema::tags::dsl::*;
    let g0s = tags.order_by(name).load( conn )?; 
    Ok(g0s)
}

pub fn tags_in ( tags0: &[&str], conn: &Conn ) 
    -> Result<Vec<models::Tag>, diesel::result::Error> {

    use crate::schema::tags::dsl::*;
    let g0s = tags.filter(name.eq_any(tags0)).order_by(name).load( conn )?; 
    Ok(g0s)
}

// Some duplicate work in here.  Need to test; I think
// it's best to work in batch.

pub fn tags_merge ( tags0: &mut [&str], conn: &Conn ) 
    -> Result<Vec<models::Tag>, diesel::result::Error> {

    use crate::schema::tags::dsl::*;
    tags0.sort();
    conn.transaction(|| {
        let g0s = tags_in( tags0, conn )?;
        let mut new = vec![];
        let mut t0iter = tags0.iter();
        let mut t1iter = g0s.iter();
        let mut t1i = t1iter.next();
        while let Some(t0) = t0iter.next() {
            if let Some(t1) = t1i {
                if t0 != &t1.name.as_str() {
                    new.push(name.eq(t0));
                }else{
                    t1i = t1iter.next();
                }
            }else{
                new.push(name.eq(t0));
            }
        }
        diesel::insert_into(tags).values(new).execute(conn)?;
        tags_in(tags0,conn)
    })
}

pub fn tags_merge_ids ( tags0: &mut [&str], conn: &Conn ) 
    -> Result<Vec<i32>, diesel::result::Error> {

    Ok(tags_merge(tags0,conn)?.iter().map(|x| x.id).collect())
}

pub fn tag_by_id ( id0: i32, conn: &Conn ) 
    -> Result<Option<models::Tag>, diesel::result::Error> {

    use crate::schema::tags::dsl::*;
    let g0s = tags
             .filter(id.eq(id0))
             .first::<models::Tag>( conn )
             .optional()?; 
    Ok(g0s)
}

pub fn tag_by_name ( name0: &str, conn: &Conn ) 
    -> Result<Option<models::Tag>, diesel::result::Error> {

    use crate::schema::tags::dsl::*;
    let g0s = tags
             .filter(name.eq(name0))
             .first::<models::Tag>( conn )
             .optional()?; 
    Ok(g0s)
}

pub fn tag_delete_by_id ( id0: i32, conn: &Conn ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::tags::dsl::*;
    diesel::delete(tags.filter(id.eq(id0))).execute(conn)
}

pub fn tag_delete_by_name ( name0: &str, conn: &Conn ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::tags::dsl::*;
    diesel::delete(tags.filter(name.eq(name0))).execute(conn)
}


