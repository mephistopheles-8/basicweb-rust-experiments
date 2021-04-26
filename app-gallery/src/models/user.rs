
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


#[derive(Serialize,Deserialize,Clone)]
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

#[derive(Serialize)]
pub struct RegisterParamsError<'a> {
    pub name: Option<&'a str>,
    pub email: Option<&'a str>,
    pub handle: Option<&'a str>,
    pub password: Option<&'a str>,
    pub confirm_password: Option<&'a str>,
    pub secret0_question: Option<&'a str>,
    pub secret0_answer: Option<&'a str>,
    pub secret1_question: Option<&'a str>,
    pub secret1_answer: Option<&'a str>,
    pub secret2_question: Option<&'a str>,
    pub secret2_answer: Option<&'a str>,
}

impl RegisterParamsError<'_> {
   pub fn empty () -> RegisterParamsError<'static> {
        RegisterParamsError {
            name : None,
            email : None,
            handle : None,
            password : None,
            confirm_password : None,
            secret0_question : None,
            secret0_answer : None,
            secret1_question : None,
            secret1_answer : None,
            secret2_question : None,
            secret2_answer : None,
        }
   }
}

pub const USER_NAME_MIN_LEN : usize = 0;

fn cond2msg<'a>( b: bool, err: &'a str ) -> Option<&'a str> {
    if !b {
        Some(err)
    }else{
        None
    }
}
impl RegisterParams {
    // TODO: Error handling.....
    pub fn is_valid(&self) -> bool {
           self.name.len() > USER_NAME_MIN_LEN &&
           // TODO: check if email and handle are unique;
           //       check if handle has URL-safe chars.
           self.secret0_question != self.secret1_question &&
           self.secret1_question != self.secret2_question &&
           self.secret0_question != self.secret2_question &&
           self.secret0_answer.len() > 0 &&
           self.secret1_answer.len() > 0 &&
           self.secret2_answer.len() > 0 &&
           self.handle.as_ref().map(|h0| crate::util::handle::handle_is_valid(h0)).unwrap_or(true) &&
           crate::util::email::email_is_valid(&self.email) &&
           crate::util::password::password_is_valid(&self.password) &&
           self.password == self.confirm_password
    }
    pub fn errors(&self) -> RegisterParamsError {
        RegisterParamsError {
            name : cond2msg(self.name.len() > USER_NAME_MIN_LEN
                       , "Name is required."), 
            email : cond2msg(crate::util::email::email_is_valid(&self.email)
                      , "Email is invalid"),
            handle : cond2msg(self.handle.as_ref().map(|h0| crate::util::handle::handle_is_valid(h0)).unwrap_or(true)
                    , "Handle must only contain lowercase alphabetic characters (a-z), digits (0-9), underscores (_) or hyphens (-)"),
            password : cond2msg(crate::util::password::password_is_valid(&self.password),
                        "Password is not strong enough.  Should contain both uppercase and lowercase letters, digits, and special characters"),
            confirm_password : cond2msg(self.password == self.confirm_password, 
                                "Password and confirmation do not match"),
            secret0_question : 
                cond2msg(self.secret0_question != self.secret1_question &&
                         self.secret0_question != self.secret2_question
                         , "Secret question must be unique"),
            secret0_answer : cond2msg(self.secret0_answer.len() > 0, "Secret question answer is required."),
            secret1_question :
                cond2msg(self.secret1_question != self.secret0_question &&
                         self.secret1_question != self.secret2_question
                         , "Secret question must be unique"),
            secret1_answer : cond2msg(self.secret1_answer.len() > 0, "Secret question answer is required."),
            secret2_question :
                cond2msg(self.secret2_question != self.secret0_question &&
                         self.secret2_question != self.secret1_question
                         , "Secret question must be unique"),
            secret2_answer : cond2msg(self.secret2_answer.len() > 0, "Secret question answer is required."),
        }
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
