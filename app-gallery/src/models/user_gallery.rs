
use crate::schema::*;
use chrono::NaiveDateTime;
use serde::{Serialize,Deserialize};
use uuid::Uuid;

#[derive(Queryable,Identifiable,Serialize,Deserialize)]
#[table_name="user_galleries"]
pub struct UserGallery {
    pub id: i32,
    pub user: i32,
    pub gallery: i32,
    pub permissions: i32,
    pub ord: i32,
    pub url: Option<String>,
    pub created: NaiveDateTime,
    pub updated: NaiveDateTime, 
}

#[derive(AsChangeset,Serialize,Deserialize)]
#[table_name = "user_galleries"]
pub struct UserGalleryUpd {
    pub permissions: i32,
    pub ord: i32,
    pub url: Option<String>,
}

#[derive(Serialize,Deserialize)]
pub struct UserGalleryOrd {
    pub uuid: Uuid, // gallery uuid
    pub ord: i32,
}

#[derive(Insertable)]
#[table_name = "user_galleries"]
pub struct UserGalleryNew<'a> {
    pub user: i32,
    pub gallery: i32,
    pub permissions: i32,
    pub ord: i32,
    pub url: Option<&'a str>,
}

#[derive(Queryable,Identifiable,Serialize,Deserialize)]
#[table_name="user_gallery_items"]
pub struct UserGalleryItem {
    pub id: i32,
    pub user: i32,
    pub gallery_item: i32,
    pub permissions: i32,
    pub ord: i32,
    pub url: Option<String>,
    pub created: NaiveDateTime,
    pub updated: NaiveDateTime, 
}

#[derive(Serialize,Deserialize)]
pub struct UserGalleryItemOrd {
    pub uuid: Uuid, // gallery_item uuid
    pub ord: i32,
}

#[derive(AsChangeset,Serialize,Deserialize)]
#[table_name = "user_gallery_items"]
pub struct UserGalleryItemUpd {
    pub permissions: i32,
    pub ord: i32,
    pub url: Option<String>,
}

#[derive(Insertable)]
#[table_name = "user_gallery_items"]
pub struct UserGalleryItemNew<'a> {
    pub user: i32,
    pub gallery_item: i32,
    pub permissions: i32,
    pub ord: i32,
    pub url: Option<&'a str>,
}

