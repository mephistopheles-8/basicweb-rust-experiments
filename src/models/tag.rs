use crate::schema::*;
use chrono::NaiveDateTime;
use serde::{Serialize,Deserialize};


#[derive(Queryable,Identifiable,Serialize,Deserialize)]
pub struct Tag {
    pub id: i32,
    pub name: String,
    pub created: NaiveDateTime,
}

#[derive(Serialize,Deserialize)]
pub struct TagPost {
    pub name: String,
}

#[derive(Insertable)]
#[table_name = "tags"]
pub struct NewTag<'a> {
    pub name: &'a str,
}

#[derive(Queryable,Identifiable,Serialize,Deserialize)]
#[table_name = "tag_bindings"]
pub struct TagBinding {
    pub id: i32,
    pub kind: i32,
    pub item_id: i32,
    pub tag: i32,
}

#[derive(Insertable,Serialize,Deserialize)]
#[table_name = "tag_bindings"]
pub struct NewTagBinding {
    pub kind: i32,
    pub item_id: i32,
    pub tag: i32,
}

