use diesel::prelude::*;
use argon2::{self, Config};

use rand::Rng;
use uuid::Uuid;

use crate::models;
use crate::db::Connection;

diesel_infix_operator!(BitOr, " | ", diesel::sql_types::Integer);

pub fn user_by_email(
    email0 : &str
  , conn: &Connection 
) -> Result<Option<models::User>, diesel::result::Error> {
    use crate::schema::users::dsl::*;
    let user = users
        .filter(email.eq(email0))
        .first::<models::User>(conn)
        .optional()?;
    Ok(user)
}

pub fn user_by_uuid(
    uuid0 : Uuid  
  , conn: &Connection 
) -> Result<Option<models::User>, diesel::result::Error> {
    use crate::schema::users::dsl::*;
    let user = users
        .filter(uuid.eq(uuid0.as_bytes().as_ref()))
        .first::<models::User>(conn)
        .optional()?;
    Ok(user)
}

pub fn user_update_name_by_uuid(
    uuid0 : Uuid
  , name0 : &str
  , conn: &Connection 
) -> Result<bool, diesel::result::Error> {
    use crate::schema::users::dsl::*;

    let user = users
        .filter(uuid.eq(uuid0.as_bytes().as_ref()));

    let n = diesel::update(user).set(name.eq(name0)).execute(conn)?;
    Ok(n > 0)
}

pub fn user_update_email_by_uuid(
    uuid0 : Uuid
  , email0 : &str
  , conn: &Connection 
) -> Result<bool, diesel::result::Error> {
    use crate::schema::users::dsl::*;

    let user = users
        .filter(uuid.eq(uuid0.as_bytes().as_ref()));

    let n = diesel::update(user).set(email.eq(email0)).execute(conn)?;
    Ok(n > 0)
}

pub fn user_update_password_by_uuid(
    uuid0 : Uuid
  , pw0 : &str
  , conn: &Connection 
) -> Result<bool, diesel::result::Error> {
    use crate::schema::users::dsl::*;

    let salt = rand::thread_rng().gen::<[u8; 32]>();
    let config = Config::default();
    let hash = argon2::hash_encoded(pw0.as_bytes(), &salt, &config).unwrap();

    let user = users
        .filter(uuid.eq(uuid0.as_bytes().as_ref()));

    let n = diesel::update(user).set(password.eq(hash)).execute(conn)?;
    Ok(n > 0)
}

pub fn user_update_code_by_email(
    email0 : &str
  , conn: &Connection 
) -> Result<bool, diesel::result::Error> {
    use crate::schema::users::dsl::*;

    // A multiple of 3 bytes typically results in a base64-encoded
    // string with no padding

    let code0 = rand::thread_rng().gen::<[u8; 9]>();

    let b64 = base64::encode(code0);

    let user = users
        .filter(email.eq(email0.to_ascii_lowercase()));

    let n = diesel::update(user).set(code.eq(b64)).execute(conn)?;

    Ok(n > 0)
}

pub fn user_verify_by_uuid( 
    uuid0: Uuid
  , code0 : &str
  , conn: &Connection 
) -> Result<bool, diesel::result::Error> {

    use crate::schema::users::dsl::*;
    let user = user_by_uuid(uuid0, conn)?;

    if let Some(u0) = user {
        if let Some(code1) = u0.code {
            if code0 == code1 {
                let user = users
                    .filter(uuid.eq(uuid0.as_bytes().as_ref()));

                // TODO: cleanup

                let one  = 1.into_sql::<diesel::sql_types::Integer>();

                diesel::update(user).set(permissions.eq(BitOr::new(permissions,one))).execute(conn)?;
                Ok(true)
            }else{
                Ok(false)
            }
        }else {
            Ok(false)
        }
    }else{
        Ok(false)
    }
}


pub fn user_by_login( 
    login: &models::LoginParams
  , conn: &Connection 
) -> Result<Option<models::User>, diesel::result::Error> {

    let user = user_by_email(&login.email.to_ascii_lowercase(), conn)?;

    if let Some(u0) = user {
        let matches = argon2::verify_encoded(&u0.password, login.password.as_bytes()).unwrap();

        if matches {
            Ok(Some(u0))
        }else{
            Ok(None)
        }
    }else{
        Ok(user)
    }
}

pub fn user_register(
    name0 : &str
  , email0 : &str
  , pw0 : &str
  , conn: &Connection 
) -> Result<Uuid, diesel::result::Error> {

    use crate::schema::users::dsl::*;

    let salt = rand::thread_rng().gen::<[u8; 32]>();
    let config = Config::default();
    let hash = argon2::hash_encoded(pw0.as_bytes(), &salt, &config).unwrap();

    let uuid0 = Uuid::new_v4();

    let new_user = models::NewUser {
        name: name0
     ,  email: email0
     ,  password: hash.as_str()
     ,  uuid : uuid0.as_bytes()
     ,  permissions : 0
    };

    diesel::insert_into(users).values(&new_user).execute(conn)?;

    Ok(uuid0)
}
