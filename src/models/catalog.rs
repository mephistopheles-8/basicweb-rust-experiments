use crate::schema::*;
use chrono::NaiveDateTime;
use crate::util::uuid_json;
use serde::{Serialize,Deserialize};


#[derive(Queryable,Identifiable,Serialize,Deserialize)]
pub struct Catalog {
    pub id: i32,
    pub name: String,
    pub description: Option<String>,
    pub kind: i32,
    pub status: i32,
    #[serde(with="uuid_json")]
    pub uuid: Vec<u8>,
    pub created: NaiveDateTime,
    pub updated: NaiveDateTime, 
}

#[derive(AsChangeset,Serialize,Deserialize)]
#[table_name = "catalogs"]
pub struct CatalogPost {
    pub name: String,
    pub description: Option<String>,
    pub kind: i32,
    pub status: i32,
}

#[derive(Insertable)]
#[table_name = "catalogs"]
pub struct NewCatalog<'a> {
    pub name: &'a str,
    pub description: Option<&'a str>,
    pub kind: i32,
    pub status: i32,
    pub uuid: &'a [u8],
}

#[derive(Queryable,Identifiable,Serialize,Deserialize)]
pub struct Product {
    pub id: i32,
    pub catalog: i32,
    pub name: String,
    pub description: Option<String>,
    pub price_int: i32,
    pub price_frac: i32,
    pub currency: String,
    pub status: i32,
    #[serde(with="uuid_json")]
    pub uuid: Vec<u8>,
    pub created: NaiveDateTime,
    pub updated: NaiveDateTime, 
}

#[derive(AsChangeset,Serialize,Deserialize)]
#[table_name = "products"]
pub struct ProductPostNew {
    pub name: String,
    pub description: Option<String>,
    pub price_int: i32,
    pub price_frac: i32,
    pub currency: String,
    pub status: i32,
}

#[derive(AsChangeset,Serialize,Deserialize)]
#[table_name = "products"]
pub struct ProductPostUpdate {
    pub name: String,
    pub description: Option<String>,
    pub status: i32,
}

#[derive(Insertable)]
#[table_name = "products"]
pub struct NewProduct<'a> {
    pub catalog: i32,
    pub name: &'a str,
    pub description: Option<&'a str>,
    pub price_int: i32,
    pub price_frac: i32,
    pub currency: &'a str,
    pub status: i32,
    pub uuid: &'a [u8],
}

#[derive(Queryable,Identifiable,Serialize,Deserialize)]
pub struct Transaction {
    pub id: i32,
    pub product: i32,
    pub txn_code: String,
    pub name: Option<String>,
    pub address: Option<String>,
    pub city: Option<String>,
    pub region: Option<String>,
    pub country: Option<String>,
    pub postal: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub last4: Option<String>,
    pub payment_method: Option<String>,
    pub amount_int: i32,
    pub amount_frac: i32,
    pub currency: String,
    #[serde(with="uuid_json")]
    pub uuid: Vec<u8>,
    pub created: NaiveDateTime,
    pub updated: NaiveDateTime, 
}

#[derive(AsChangeset,Serialize,Deserialize)]
#[table_name = "transactions"]
pub struct TransactionPost {
    pub product: i32,
    pub txn_code: String,
    pub name: Option<String>,
    pub address: Option<String>,
    pub city: Option<String>,
    pub region: Option<String>,
    pub country: Option<String>,
    pub postal: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub last4: Option<String>,
    pub payment_method: Option<String>,
    pub amount_int: i32,
    pub amount_frac: i32,
    pub currency: String,
}

#[derive(Insertable)]
#[table_name = "transactions"]
pub struct NewTransaction<'a> {
    pub product: i32,
    pub txn_code: &'a str,
    pub name: Option<&'a str>,
    pub address: Option<&'a str>,
    pub city: Option<&'a str>,
    pub region: Option<&'a str>,
    pub country: Option<&'a str>,
    pub postal: Option<&'a str>,
    pub email: Option<&'a str>,
    pub phone: Option<&'a str>,
    pub last4: Option<&'a str>,
    pub payment_method: Option<&'a str>,
    pub amount_int: i32,
    pub amount_frac: i32,
    pub currency: &'a str,
    pub uuid: &'a [u8],
}

