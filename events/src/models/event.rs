use crate::schema::events;
use chrono::NaiveDateTime;
use crate::util::uuid_json;
use serde::{Serialize,Deserialize};


#[derive(Queryable,Identifiable,Serialize,Deserialize)]
pub struct Event {
    pub id: i32,
    pub location: i32,
    pub name: String,
    pub description: Option<String>,
    pub start_time: NaiveDateTime,
    pub end_time: NaiveDateTime,
    pub timezone: String,
    #[serde(with="uuid_json")]
    pub uuid: Vec<u8>,
    pub created: NaiveDateTime,
    pub updated: NaiveDateTime, 
}

#[derive(AsChangeset,Serialize,Deserialize)]
#[table_name = "events"]
pub struct EventUpd {
    pub location: i32,
    pub name: String,
    pub description: Option<String>,
    pub start_time: NaiveDateTime,
    pub end_time: NaiveDateTime,
    pub timezone: String,
}

#[derive(Insertable)]
#[table_name = "events"]
pub struct EventNew<'a> {
    pub location: i32,
    pub name: &'a str,
    pub description: Option<&'a str>,
    pub start_time: NaiveDateTime,
    pub end_time: NaiveDateTime,
    pub timezone: &'a str,
}

