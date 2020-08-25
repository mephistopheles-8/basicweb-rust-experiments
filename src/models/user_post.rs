
use crate::schema::*;
use chrono::NaiveDateTime;
use serde::{Serialize,Deserialize};


#[derive(Queryable,Identifiable,Serialize,Deserialize)]
#[table_name="user_posts"]
pub struct UserPost {
    pub id: i32,
    pub user: i32,
    pub post: i32,
    pub permissions: i32,
    pub ord: i32,
    pub url: Option<String>,
    pub created: NaiveDateTime,
    pub updated: NaiveDateTime, 
}

#[derive(AsChangeset,Serialize,Deserialize)]
#[table_name = "user_posts"]
pub struct UserPostPost {
    pub permissions: i32,
    pub ord: i32,
    pub url: Option<String>,
}

#[derive(Insertable)]
#[table_name = "user_posts"]
pub struct NewUserPost<'a> {
    pub user: i32,
    pub post: i32,
    pub permissions: i32,
    pub ord: i32,
    pub url: Option<&'a str>,
}
