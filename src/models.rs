
use super::schema::users;
use chrono::NaiveDateTime;

#[derive(Queryable,Identifiable)]
pub struct User {
    pub id: i32,
    pub name: String,
    pub email: String,
    pub password: String,
    pub uuid: Vec<u8>,
    pub code: Option<String>,
    pub permissions: i32,
    pub created: NaiveDateTime, 
    pub updated: NaiveDateTime, 
}

#[derive(Insertable)]
#[table_name = "users"]
pub struct NewUser<'a> {
    pub name: &'a str,
    pub email: &'a str,
    pub password: &'a str,
    pub uuid: &'a [u8],
    pub permissions: i32,
}
