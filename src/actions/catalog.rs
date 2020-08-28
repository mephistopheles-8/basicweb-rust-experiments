
use diesel::prelude::*;
use crate::db::Connection;
use crate::models;
use uuid::Uuid;


pub fn catalog_create( 
        catalog0: &models::CatalogUpd, conn: &Connection 
    ) -> Result<Uuid, diesel::result::Error> {

    use crate::schema::catalogs::dsl::*;

    let uuid0 = Uuid::new_v4();

    let new_catalog = models::CatalogNew {
        name: &catalog0.name,
        description: catalog0.description.as_deref(),
        kind: catalog0.kind,
        status: catalog0.kind,
        uuid: uuid0.as_bytes(),
    };

    diesel::insert_into(catalogs).values(&new_catalog).execute(conn)?;
    Ok(uuid0)
}

pub fn catalogs_all ( conn: &Connection ) 
    -> Result<Vec<models::Catalog>, diesel::result::Error> {

    use crate::schema::catalogs::dsl::*;
    let g0s = catalogs.order_by(name).load( conn )?; 
    Ok(g0s)
}

pub fn catalog_by_id ( id0: i32, conn: &Connection ) 
    -> Result<Option<models::Catalog>, diesel::result::Error> {

    use crate::schema::catalogs::dsl::*;
    let g0s = catalogs
             .filter(id.eq(id0))
             .first::<models::Catalog>( conn )
             .optional()?; 
    Ok(g0s)
}

pub fn catalog_by_uuid ( uuid0: Uuid, conn: &Connection ) 
    -> Result<Option<models::Catalog>, diesel::result::Error> {

    use crate::schema::catalogs::dsl::*;
    let g0s = catalogs
              .filter(uuid.eq(uuid0.as_bytes().as_ref()))
              .first::<models::Catalog>( conn )
              .optional()?; 
    Ok(g0s)
}

pub fn catalog_delete_by_id ( id0: i32, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::catalogs::dsl::*;
    diesel::delete(catalogs.filter(id.eq(id0))).execute(conn)
}

pub fn catalog_delete_by_uuid ( uuid0: Uuid, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::catalogs::dsl::*;
    diesel::delete(catalogs.filter(uuid.eq(uuid0.as_bytes().as_ref()))).execute(conn)
}

pub fn catalog_update_by_id( 
        data: &models::CatalogUpd, id0: i32, conn: &Connection 
    ) -> Result<usize, diesel::result::Error> {

    use crate::schema::catalogs::dsl::*;

    diesel::update(catalogs.filter(id.eq(id0))).set(data).execute(conn)
}

pub fn catalog_update_by_uuid( 
        data: &models::CatalogUpd, uuid0: Uuid, conn: &Connection 
    ) -> Result<usize, diesel::result::Error> {

    use crate::schema::catalogs::dsl::*;

    diesel::update(catalogs.filter(uuid.eq(uuid0.as_bytes().as_ref()))).set(data).execute(conn)
}

pub fn catalog_update_name_by_id ( name0: &str, id0: i32, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::catalogs::dsl::*;
    diesel::update(catalogs.filter(id.eq(id0))).set(name.eq(name0)).execute(conn)
}

pub fn catalog_update_description_by_id ( description0: Option<&str>, id0: i32, conn: &Connection ) 
    -> Result<usize, diesel::result::Error> {

    use crate::schema::catalogs::dsl::*;
    diesel::update(catalogs.filter(id.eq(id0))).set(description.eq(description0)).execute(conn)
}

