use diesel::prelude::*;
use argon2::{self, Config};

use rand::Rng;
use rand::distributions::Standard;
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

pub fn user_by_pubkey(
    pubkey0: &str 
  , conn: &Connection 
) -> Result<Option<models::User>, diesel::result::Error> {
    use crate::schema::users::dsl::*;
    let user = users
        .filter(pubkey.eq(pubkey0))
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
    let code1 : Vec<u8> = 
        rand::thread_rng().sample_iter(&Standard).take(64).collect();

    let c0b64 = base64::encode_config(code0,base64::URL_SAFE);
    let c1b64 = base64::encode_config(code1,base64::URL_SAFE);

    let user = users
        .filter(email.eq(email0.to_ascii_lowercase()));

    let n = diesel::update(user).set(
            ( code.eq(c0b64), pubkey.eq(c1b64) )
        ).execute(conn)?;

    Ok(n > 0)
}

pub fn user_update_code_by_uuid(
    uuid0 : Uuid
  , conn: &Connection 
) -> Result<bool, diesel::result::Error> {
    use crate::schema::users::dsl::*;

    // A multiple of 3 bytes typically results in a base64-encoded
    // string with no padding

    let code0 = rand::thread_rng().gen::<[u8; 9]>();
    let code1 : Vec<u8> = 
        rand::thread_rng().sample_iter(&Standard).take(64).collect();

    let c0b64 = base64::encode_config(code0,base64::URL_SAFE);
    let c1b64 = base64::encode_config(code1,base64::URL_SAFE);

    let user = users
        .filter(uuid.eq(uuid0.as_bytes().as_ref()));

    let n = diesel::update(user).set(
            ( code.eq(c0b64), pubkey.eq(c1b64) )
        ).execute(conn)?;

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
                diesel::update(user).set((
                    permissions.eq(BitOr::new(permissions,one))
                 ,  code.eq::<Option<String>>(None)
                 ,  pubkey.eq::<Option<String>>(None)
                )).execute(conn)?;

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

pub fn user_verify_by_pubkey( 
    pubkey0: &str
  , code0 : &str
  , conn: &Connection 
) -> Result<Option<Uuid>, diesel::result::Error> {

    use crate::schema::users::dsl::*;
    let user = user_by_pubkey(&pubkey0, conn)?;

    if let Some(u0) = user {
        if let Some(code1) = u0.code {
            if code0 == code1 {
                let user = users
                    .filter(id.eq(u0.id));

                // TODO: cleanup

                let one  = 1.into_sql::<diesel::sql_types::Integer>();
                diesel::update(user).set((
                    permissions.eq(BitOr::new(permissions,one))
                 ,  code.eq::<Option<String>>(None)
                 ,  pubkey.eq::<Option<String>>(None)
                )).execute(conn)?;

                Ok(Some(Uuid::from_slice(&u0.uuid).unwrap()))
            }else{
                Ok(None)
            }
        }else {
            Ok(None)
        }
    }else{
        Ok(None)
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
    data : &models::RegisterParams
  , conn: &Connection 
) -> Result<Uuid, diesel::result::Error> {

    use crate::schema::users::dsl::*;

    let salt0 = rand::thread_rng().gen::<[u8; 32]>();
    let salt1 = rand::thread_rng().gen::<[u8; 32]>();
    let salt2 = rand::thread_rng().gen::<[u8; 32]>();
    let salt3 = rand::thread_rng().gen::<[u8; 32]>();

    let config = Config::default();

    let hash = argon2::hash_encoded(data.password.as_bytes(), &salt0, &config).unwrap();
    let a0hash = argon2::hash_encoded(data.secret0_answer.as_bytes(), &salt1, &config).unwrap();
    let a1hash = argon2::hash_encoded(data.secret1_answer.as_bytes(), &salt2, &config).unwrap();
    let a2hash = argon2::hash_encoded(data.secret2_answer.as_bytes(), &salt3, &config).unwrap();

    let uuid0 = Uuid::new_v4();

    let new_user = models::UserNew {
        name: &data.name
     ,  email: &data.email
     ,  handle: data.handle.as_deref()
     ,  secret0_question: data.secret0_question
     ,  secret0_answer: a0hash.as_str()
     ,  secret1_question: data.secret1_question
     ,  secret1_answer: a1hash.as_str()
     ,  secret2_question: data.secret2_question
     ,  secret2_answer: a2hash.as_str()
     ,  password: hash.as_str()
     ,  uuid : uuid0.as_bytes()
     ,  permissions : 0
    };

    diesel::insert_into(users).values(&new_user).execute(conn)?;

    Ok(uuid0)
}

pub fn user_handle_exists( 
    handle0 : &str,
    conn: &Connection, 
) -> Result<bool, diesel::result::Error> {

    use crate::schema::users::dsl::*;
    let exists 
        = diesel::select(diesel::dsl::exists(users.filter(handle.eq(handle0))))
          .first(conn)?;
    Ok(exists)
}

pub fn user_email_exists( 
    email0 : &str,
    conn: &Connection, 
) -> Result<bool, diesel::result::Error> {

    use crate::schema::users::dsl::*;
    let exists 
        = diesel::select(diesel::dsl::exists(users.filter(email.eq(email0))))
          .first(conn)?;
    Ok(exists)
}

pub fn user_handles_like(
    like: &str, 
    conn: &Connection, 
) -> Result<Vec<String>, diesel::result::Error> {

    use crate::schema::users::dsl::*;
    let handles
        = users.filter(handle.like(like).and(handle.is_not_null()))
          .order_by(handle.asc())
          .select(handle)
          .load::<Option<String>>(conn)?;

    // FIXME: This shouldn't be necessary
    Ok(handles.into_iter().map(|x| x.unwrap()).collect())
}
