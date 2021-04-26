
use crate::schema::*;
use chrono::NaiveDateTime;
use serde::{Serialize,Deserialize};

#[derive(Queryable,Identifiable,Serialize,Deserialize)]
#[table_name="gallery_posts"]
pub struct GalleryPost {
    pub id: i32,
    pub gallery: i32,
    pub post: i32,
    pub created: NaiveDateTime,
    pub updated: NaiveDateTime, 
}

#[derive(Insertable)]
#[table_name = "gallery_posts"]
pub struct GalleryPostNew {
    pub gallery: i32,
    pub post: i32,
}

#[derive(Queryable,Identifiable,Serialize,Deserialize)]
#[table_name="gallery_item_posts"]
pub struct GalleryItemPost {
    pub id: i32,
    pub gallery_item: i32,
    pub post: i32,
    pub created: NaiveDateTime,
    pub updated: NaiveDateTime, 
}

#[derive(Insertable)]
#[table_name = "gallery_item_posts"]
pub struct GalleryItemPostNew{
    pub gallery_item: i32,
    pub post: i32,
}
