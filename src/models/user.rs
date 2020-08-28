
use crate::schema::{users,secret_questions};
use chrono::NaiveDateTime;
use serde::{Serialize,Deserialize};

#[derive(Serialize, Deserialize)]
pub struct LoginParams {
    pub email: String,
    pub password: String,
}

#[derive(Queryable,Identifiable,Serialize,Deserialize)]
#[table_name = "secret_questions"]
pub struct SecretQuestion {
    pub id: i32,
    pub question: String,
    pub active: bool,
}

#[derive(Queryable,Identifiable)]
#[table_name = "users"]
pub struct User {
    pub id: i32,
    pub name: String,
    pub email: String,
    pub handle: Option<String>,
    pub password: String,
    pub secret0_question : i32,
    pub secret0_answer : String,
    pub secret1_question : i32,
    pub secret1_answer : String,
    pub secret2_question : i32,
    pub secret2_answer : String,
    pub uuid: Vec<u8>,
    pub code: Option<String>,
    pub pubkey: Option<String>,
    pub permissions: i32,
    pub created: NaiveDateTime, 
    pub updated: NaiveDateTime, 
}

#[derive(Queryable,Identifiable)]
#[table_name = "users"]
pub struct UserSecrets {
    pub id: i32,
    pub secret0_question : i32,
    pub secret0_answer : String,
    pub secret1_question : i32,
    pub secret1_answer : String,
    pub secret2_question : i32,
    pub secret2_answer : String,
}

#[derive(Serialize,Deserialize)]
pub struct RegisterParams {
    pub name: String,
    pub email: String,
    pub handle: Option<String>,
    pub password: String,
    pub confirm_password: String,
    pub secret0_question : i32,
    pub secret0_answer : String,
    pub secret1_question : i32,
    pub secret1_answer : String,
    pub secret2_question : i32,
    pub secret2_answer : String,
}

impl RegisterParams {
    // TODO: Error handling.....
    pub fn is_valid(&self) -> bool {
           self.name.len() > 0 &&
           // TODO: check if email and handle are unique;
           //       check if handle has URL-safe chars.
           self.secret0_question != self.secret1_question &&
           self.secret1_question != self.secret2_question &&
           self.secret0_question != self.secret2_question &&
           self.secret0_answer.len() > 0 &&
           self.secret1_answer.len() > 0 &&
           self.secret2_answer.len() > 0 &&
           crate::util::email::email_is_valid(&self.email) &&
           self.password.len() > 8 &&
           self.password == self.confirm_password
    }
}

#[derive(Insertable)]
#[table_name = "users"]
pub struct UserNew<'a> {
    pub name: &'a str,
    pub email: &'a str,
    pub handle: Option<&'a str>,
    pub password: &'a str,
    pub secret0_question : i32,
    pub secret0_answer : &'a str,
    pub secret1_question : i32,
    pub secret1_answer : &'a str,
    pub secret2_question : i32,
    pub secret2_answer : &'a str,
    pub uuid: &'a [u8],
    pub permissions: i32,
}
