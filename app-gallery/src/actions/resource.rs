
use diesel::prelude::*;
use uuid::Uuid;
use crate::models;
use crate::db::Connection as Connection0;
use crate::actions::gallery::*;
use crate::actions::gallery_item::*;

pub fn resource_create ( 
      filepath0: &str
    , mime0: &str
    , kind0: i32
    , conn: &Connection0 
  ) -> Result<Uuid, diesel::result::Error> {

   use crate::schema::resources::dsl::*;

   let uuid0 = Uuid::new_v4();

   let new_resource = models::ResourceNew {
        filepath : filepath0
      , kind : kind0
      , mime : mime0
      , uuid : uuid0.as_bytes()
   };

    diesel::insert_into(resources).values(&new_resource).execute(conn)?;

    Ok(uuid0)
}

pub fn gallery_item_resource_create_id( 
      name0 : &str
    , description0: &str
    , kinds: (i32,i32)
    , filepath0 : &str 
    , mime0 : &str 
    , gallery0: i32
    , conn: &Connection0 
  ) -> Result<(Uuid,Uuid), diesel::result::Error> {

   use crate::schema::resources::dsl::*;

   conn.transaction(|| {
        let res_uuid = resource_create(filepath0,mime0,kinds.1,conn)?;
    
        let res = resources
                  .filter(uuid.eq(res_uuid.as_bytes().as_ref()))
                  .first::<models::Resource>(conn)?; 
        
        let gi_uuid = gallery_item_create(name0,description0,kinds.0,gallery0, res.id, conn)?;

        Ok((res_uuid, gi_uuid))
    })
}

pub fn gallery_item_resource_create_uuid( 
      name0 : &str
    , description0: &str
    , kinds: (i32,i32)
    , filepath0 : &str 
    , mime0 : &str 
    , gallery0: Uuid
    , conn: &Connection0 
  ) -> Result<(Uuid,Uuid), diesel::result::Error> {

   use crate::schema::resources::dsl::*;

   conn.transaction(|| {
        let res_uuid = resource_create(filepath0,mime0,kinds.1,conn)?;
    
        let res = resources
                  .filter(uuid.eq(res_uuid.as_bytes().as_ref()))
                  .first::<models::Resource>(conn)?; 
        
        let gallery = gallery_by_uuid(gallery0, conn)?.unwrap(); 

        let gi_uuid = gallery_item_create(name0,description0,kinds.0,gallery.id, res.id, conn)?;

        Ok((res_uuid, gi_uuid))
    })
}

