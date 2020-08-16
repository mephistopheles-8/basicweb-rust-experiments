use super::schema::*;
use chrono::NaiveDateTime;
use crate::util::uuid_json;
use serde::{Serialize,Deserialize};


#[derive(Queryable,Identifiable,Serialize,Deserialize)]
pub struct Item {
    pub id: i32,
    pub name: String,
    pub description: Option<String>,
    #[serde(with="uuid_json")]
    pub uuid: Vec<u8>,
    pub created: NaiveDateTime,
    pub updated: NaiveDateTime, 
}

#[derive(AsChangeset,Serialize,Deserialize)]
#[table_name = "items"]
pub struct ItemPost {
    pub name: String,
    pub description: Option<String>,
}

#[derive(Insertable)]
#[table_name = "items"]
pub struct NewItem<'a> {
    pub name: &'a str,
    pub description: Option<&'a str>,
    pub uuid: &'a [u8],
}

