
use diesel::prelude::*;
use crate::db::Connection;
use crate::models;
use uuid::Uuid;


pub fn item_create( 
        item0: &models::ItemUpd, conn: &Connection 
    ) -> Result<Uuid, diesel::result::Error> {

    use crate::schema::items::dsl::*;

    let uuid0 = Uuid::new_v4();

    let new_item = models::ItemNew {
        name: &item0.name,
        description: item0.description.as_deref(),
        uuid: uuid0.as_bytes(),
    };

    diesel::insert_into(items).values(&new_item).execute(conn)?;
    Ok(uuid0)
}

pub fn items_all ( conn: &Connection ) 
    -> Result<Vec<models::Item>, diesel::result::Error> {

    use crate::schema::items::dsl::*;
    let g0s = items.order_by(name).load( conn )?; 
    Ok(g0s)
}

pub fn item_by_id ( id0: i32, conn: &Connection ) 
    -> Result<Option<models::Item>, diesel::result::Error> {

    use crate::schema::items::dsl::*;
    let g0s = items
             .filter(id.eq(id0))
             .first::<models::Item>( conn )
             .optional()?; 
    Ok(g0s)
}

pub fn item_by_uuid ( uuid0: Uuid, conn: &Connection ) 
    -> Result<Option<models::Item>, diesel::result::Error> {

    use crate::schema::items::dsl::*;
    let g0s = items
              .filter(uuid.eq(uuid0.as_bytes().as_ref()))
              .first::<models::Item>( conn )
              .optional()?; 
    Ok(g0s)
}

pub fn item_delete_by_id ( id0: i32, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::items::dsl::*;
    diesel::delete(items.filter(id.eq(id0))).execute(conn)
}

pub fn item_delete_by_uuid ( uuid0: Uuid, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::items::dsl::*;
    diesel::delete(items.filter(uuid.eq(uuid0.as_bytes().as_ref()))).execute(conn)
}

pub fn item_update_by_id( 
        data: &models::ItemUpd, id0: i32, conn: &Connection 
    ) -> Result<usize, diesel::result::Error> {

    use crate::schema::items::dsl::*;

    diesel::update(items.filter(id.eq(id0))).set(data).execute(conn)
}

pub fn item_update_by_uuid( 
        data: &models::ItemUpd, uuid0: Uuid, conn: &Connection 
    ) -> Result<usize, diesel::result::Error> {

    use crate::schema::items::dsl::*;

    diesel::update(items.filter(uuid.eq(uuid0.as_bytes().as_ref()))).set(data).execute(conn)
}

pub fn item_update_name_by_id ( name0: &str, id0: i32, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::items::dsl::*;
    diesel::update(items.filter(id.eq(id0))).set(name.eq(name0)).execute(conn)
}

pub fn item_update_description_by_id ( description0: Option<&str>, id0: i32, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::items::dsl::*;
    diesel::update(items.filter(id.eq(id0))).set(description.eq(description0)).execute(conn)
}

