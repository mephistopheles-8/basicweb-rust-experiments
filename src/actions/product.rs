
use diesel::prelude::*;
use crate::db::Connection;
use crate::models;
use uuid::Uuid;


pub fn product_create( 
        catalog0: i32, product0: &models::ProductPostNew, conn: &Connection 
    ) -> Result<Uuid, diesel::result::Error> {

    use crate::schema::products::dsl::*;

    let uuid0 = Uuid::new_v4();

    let new_product = models::NewProduct {
        catalog: catalog0,
        name: &product0.name,
        description: product0.description.as_deref(),
        price_int: product0.price_int,
        price_frac: product0.price_frac,
        currency: &product0.currency,
        status: product0.status,
        uuid: uuid0.as_bytes(),
    };

    diesel::insert_into(products).values(&new_product).execute(conn)?;
    Ok(uuid0)
}

pub fn products_all ( conn: &Connection ) 
    -> Result<Vec<models::Product>, diesel::result::Error> {

    use crate::schema::products::dsl::*;
    let g0s = products.order_by(name).load( conn )?; 
    Ok(g0s)
}

pub fn product_by_id ( id0: i32, conn: &Connection ) 
    -> Result<Option<models::Product>, diesel::result::Error> {

    use crate::schema::products::dsl::*;
    let g0s = products
             .filter(id.eq(id0))
             .first::<models::Product>( conn )
             .optional()?; 
    Ok(g0s)
}

pub fn product_by_uuid ( uuid0: Uuid, conn: &Connection ) 
    -> Result<Option<models::Product>, diesel::result::Error> {

    use crate::schema::products::dsl::*;
    let g0s = products
              .filter(uuid.eq(uuid0.as_bytes().as_ref()))
              .first::<models::Product>( conn )
              .optional()?; 
    Ok(g0s)
}

pub fn product_delete_by_id ( id0: i32, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::products::dsl::*;
    diesel::delete(products.filter(id.eq(id0))).execute(conn)
}

pub fn product_delete_by_uuid ( uuid0: Uuid, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::products::dsl::*;
    diesel::delete(products.filter(uuid.eq(uuid0.as_bytes().as_ref()))).execute(conn)
}

pub fn product_update_by_id( 
        data: &models::ProductPostUpdate, id0: i32, conn: &Connection 
    ) -> Result<usize, diesel::result::Error> {

    use crate::schema::products::dsl::*;

    diesel::update(products.filter(id.eq(id0))).set(data).execute(conn)
}

pub fn product_update_by_uuid( 
        data: &models::ProductPostUpdate, uuid0: Uuid, conn: &Connection 
    ) -> Result<usize, diesel::result::Error> {

    use crate::schema::products::dsl::*;

    diesel::update(products.filter(uuid.eq(uuid0.as_bytes().as_ref()))).set(data).execute(conn)
}

pub fn product_update_name_by_id ( name0: &str, id0: i32, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::products::dsl::*;
    diesel::update(products.filter(id.eq(id0))).set(name.eq(name0)).execute(conn)
}

pub fn product_update_description_by_id ( description0: Option<&str>, id0: i32, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::products::dsl::*;
    diesel::update(products.filter(id.eq(id0))).set(description.eq(description0)).execute(conn)
}

