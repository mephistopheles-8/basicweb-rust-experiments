use super::schema::*;
use chrono::NaiveDateTime;
use crate::util::uuid_json;
use serde::{Serialize,Deserialize};

#[derive(Queryable,Identifiable,Serialize,Deserialize)]
#[table_name = "galleries"]
pub struct Gallery {
    pub id: i32,
    pub kind: i32,
    pub name: String,
    pub description: String,
    #[serde(with="uuid_json")]
    pub uuid: Vec<u8>,
    pub created: NaiveDateTime,
    pub updated: NaiveDateTime, 
}

#[derive(AsChangeset,Serialize,Deserialize)]
#[table_name = "galleries"]
pub struct GalleryPost {
    pub kind: i32,
    pub name: String,
    pub description: String,
}

#[derive(Insertable)]
#[table_name = "galleries"]
pub struct NewGallery<'a> {
    pub kind: i32,
    pub name: &'a str,
    pub description: &'a str,
    pub uuid: &'a [u8],
}

#[derive(Queryable,Identifiable,Serialize,Deserialize)]
#[table_name = "gallery_items"]
pub struct GalleryItem {
    pub id: i32,
    pub gallery: i32,
    pub resource: i32,
    pub kind: i32,
    pub name: String,
    pub description: String,
    #[serde(with="uuid_json")]
    pub uuid: Vec<u8>,
    pub created: NaiveDateTime, 
    pub updated: NaiveDateTime, 
}

#[derive(AsChangeset,Serialize,Deserialize)]
#[table_name = "gallery_items"]
pub struct GalleryItemPost {
    pub name : String,
    pub description : String,
    pub kind : i32,
}

#[derive(Insertable)]
#[table_name = "gallery_items"]
pub struct NewGalleryItem<'a> {
    pub gallery: i32,
    pub resource: i32,
    pub kind: i32,
    pub name: &'a str,
    pub description: &'a str,
    pub uuid: &'a [u8],
}

#[derive(Queryable,Identifiable,Serialize,Deserialize)]
#[table_name = "resources"]
pub struct Resource {
    pub id: i32,
    pub filepath: String,
    pub kind: i32,
    pub mime: String,
    #[serde(with="uuid_json")]
    pub uuid: Vec<u8>,
    pub created: NaiveDateTime, 
    pub updated: NaiveDateTime, 
}

#[derive(Insertable)]
#[table_name = "resources"]
pub struct NewResource<'a> {
    pub filepath: &'a str,
    pub kind: i32,
    pub mime: &'a str,
    pub uuid: &'a [u8],
}

