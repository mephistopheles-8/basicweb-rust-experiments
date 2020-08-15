use super::schema::*;
use chrono::NaiveDateTime;
use serde::{Serialize,Deserialize};
use crate::util::uuid_json;

#[derive(Queryable,Identifiable,Serialize,Deserialize)]
pub struct Location {
    pub id: i32,
    pub name: String,
    pub description: Option<String>,
    pub address: Option<String>,
    pub city: Option<String>,
    pub region: Option<String>,
    pub postal: Option<String>,
    pub country: Option<String>,
    pub lat: f64,
    pub lng: f64,
    #[serde(with="uuid_json")]
    pub uuid: Vec<u8>,
    pub created: NaiveDateTime,
    pub updated: NaiveDateTime, 
}

#[derive(AsChangeset)]
#[table_name = "locations"]
pub struct LocationUpdate<'a> {
    pub name: &'a str,
    pub description: Option<&'a str>,
    pub address: Option<&'a str>,
    pub city: Option<&'a str>,
    pub region: Option<&'a str>,
    pub postal: Option<&'a str>,
    pub country: Option<&'a str>,
    pub lat: f64,
    pub lng: f64,
}


#[derive(Insertable)]
#[table_name = "locations"]
pub struct NewLocation<'a> {
    pub name: &'a str,
    pub description: Option<&'a str>,
    pub address: Option<&'a str>,
    pub city: Option<&'a str>,
    pub region: Option<&'a str>,
    pub postal: Option<&'a str>,
    pub country: Option<&'a str>,
    pub lat: f64,
    pub lng: f64,
    pub uuid: &'a [u8],
}


