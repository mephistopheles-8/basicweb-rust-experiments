
use crate::schema::*;
use chrono::NaiveDateTime;
use serde::{Serialize,Deserialize};


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
pub struct UserGalleryPost {
    pub permissions: i32,
    pub ord: i32,
    pub url: Option<String>,
}

#[derive(Insertable)]
#[table_name = "user_galleries"]
pub struct NewUserGallery<'a> {
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

#[derive(AsChangeset,Serialize,Deserialize)]
#[table_name = "user_gallery_items"]
pub struct UserGalleryItemPost {
    pub permissions: i32,
    pub ord: i32,
    pub url: Option<String>,
}

#[derive(Insertable)]
#[table_name = "user_gallery_items"]
pub struct NewUserGalleryItem<'a> {
    pub user: i32,
    pub gallery_item: i32,
    pub permissions: i32,
    pub ord: i32,
    pub url: Option<&'a str>,
}

