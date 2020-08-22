
use actix_identity::Identity;
use actix_web::{web, HttpResponse};
use lettre::transport::smtp::authentication::Credentials;
use lettre::{Message, SmtpTransport, Transport};

use handlebars::Handlebars;
use serde::{Deserialize, Serialize};
use chrono::NaiveDateTime;
use uuid::Uuid;

use crate::models;
use crate::db::DbPool;
use crate::util::email::email_is_valid;
use crate::actions::user::*;

#[derive(Serialize,Deserialize)]
pub enum UserSession {
    Authorized(Uuid,Vec<Uuid>),
    Partial(Uuid),
}

impl UserSession {
    fn is_authorized(&self) -> bool {
        match self {
            UserSession::Authorized(_,_) => true,
            _ => false,
        }
    }
    fn is_unconfirmed(&self) -> bool {
        match self {
            UserSession::Partial(_) => true,
            _ => false,
        }
    }
    fn is_simulated(&self) -> bool {
        match self {
            UserSession::Authorized(_,users) => !users.is_empty(),
            _ => false,
        }
    }
    fn uuid(&self) -> &Uuid {
        match self {
            UserSession::Authorized(uuid,_) => uuid,
            UserSession::Partial(uuid) => uuid,
        }
    }
    fn simulate_push(&mut self,u0:Uuid) -> bool {
        match self {
            UserSession::Authorized(u1,users) => {
                users.push(*u1);
                *u1 = u0;
                true
            },
            _ => false
        }
    }
    fn simulate_pop(&mut self) -> bool {
        match self {
            UserSession::Authorized(u1,users) => {
                let u0 = users.pop();
                if u0.is_some() {
                    *u1 = u0.unwrap();
                    true
                }else{
                    false
                }
            },
            _ => false
        }
    }
}


pub async fn login_form(id: Identity, hb: web::Data<Handlebars<'_>>) -> HttpResponse {
    if id.identity().is_none() {
        let data = json!({
            "title": "Login"
          , "parent" : "main"
          , "logged_in" : false 
        });
        let body = hb.render("content/login", &data).unwrap();

        HttpResponse::Ok().body(body)
    }else{
        HttpResponse::Found().header("location", "/manage-account").finish()
    }
}


pub async fn login_action_json(
    id: Identity
  , pool: web::Data<DbPool>
  , data: web::Json<models::LoginParams>
 ) -> Result<HttpResponse,actix_web::Error> {
    id.forget();
    let conn = pool.get().expect("couldn't get db connection from pool");
    
    // use web::block to offload blocking Diesel code without blocking server thread
    let user = web::block(move || user_by_login(&data, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    if let Some(user) = user {
        let uuid 
            = uuid::Builder::from_slice(&user.uuid)
             .map_err(|e| {
                    eprintln!("{}", e);
                    HttpResponse::InternalServerError().finish()
             })?.build();

        let sess = UserSession::Authorized(uuid,vec![]);

        id.remember(serde_json::to_string(&sess).unwrap());

        Ok(HttpResponse::NoContent().finish())

    } else {
        Ok(HttpResponse::Unauthorized().finish())
    }
}

pub async fn login_action(
    id: Identity
  , pool: web::Data<DbPool>
  , data: web::Form<models::LoginParams>
 ) -> Result<HttpResponse,actix_web::Error> {
    id.forget();
    let conn = pool.get().expect("couldn't get db connection from pool");
    
    // use web::block to offload blocking Diesel code without blocking server thread
    let user = web::block(move || user_by_login(&data, &conn))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    if let Some(user) = user {
        let uuid 
            = uuid::Builder::from_slice(&user.uuid)
             .map_err(|e| {
                    eprintln!("{}", e);
                    HttpResponse::InternalServerError().finish()
             })?.build();

        let sess = UserSession::Authorized(uuid,vec![]);

        id.remember(serde_json::to_string(&sess).unwrap());

        if user.permissions == 0 {
            Ok(HttpResponse::Found().header("location", "/verify-account").finish())
        }else{
            Ok(HttpResponse::Found().header("location", "/manage-account").finish())
        }

    } else {
        Ok(HttpResponse::Found().header("location", "/login").finish())
    }
}

/// This needs to be exposed very, very carefully.
/// There is enough variety that I will not implement it now.

pub async fn simulate_user(
    id: Identity
  , user: Uuid
 ) -> Result<HttpResponse,actix_web::Error> {
    if let Some(sess) = id.identity() {
       let mut sess : UserSession = serde_json::from_str(&sess)?;
       if sess.is_authorized() {
            sess.simulate_push(user);
            Ok(HttpResponse::NoContent().finish())
       }else{
            Ok(HttpResponse::Forbidden().finish())
       }
    }else{
        Ok(HttpResponse::Unauthorized().finish())
    }
}



#[derive(Serialize, Deserialize)]
pub struct RegisterParams {
    pub name: String,
    pub email: String,
    pub password: String,
    pub confirm_password: String,
}


impl RegisterParams {
    fn is_valid(&self) -> bool {
        self.name.len() > 0 &&
           email_is_valid(&self.email) &&
           self.password.len() > 8 &&
           self.password == self.confirm_password
    }
}

pub async fn register_form(id: Identity, hb: web::Data<Handlebars<'_>>) -> HttpResponse {
    let data = json!({
        "title": "Register"
      , "parent" : "main"
      , "logged_in" : id.identity().is_some()
    });
    let body = hb.render("content/register", &data).unwrap();

    HttpResponse::Ok().body(body)
}


pub async fn register_action(
    id: Identity
  , pool: web::Data<DbPool>
  , data: web::Form<RegisterParams>
 ) -> Result<HttpResponse,actix_web::Error> {

    id.forget();
    
    let conn = pool.get().expect("couldn't get db connection from pool");
    
    if data.is_valid() {

        let uuid = web::block(move || 
            user_register(
                &data.name, &data.email.to_ascii_lowercase(), &data.password, &conn
              )
            ).await
            .map_err(|e| {
                eprintln!("{}", e);
                HttpResponse::InternalServerError().finish()
            })?;

        let sess = UserSession::Partial(uuid);

        id.remember(serde_json::to_string(&sess)?);

        Ok(HttpResponse::Found().header("location", "/verify-account").finish())

    }else{
        Ok(HttpResponse::Found().header("location", "/register").finish())
    }
}

pub async fn register_action_json(
    pool: web::Data<DbPool>
  , data: web::Json<RegisterParams>
 ) -> Result<HttpResponse,actix_web::Error> {
    
    let conn = pool.get().expect("couldn't get db connection from pool");

    if data.is_valid() {

        let _uuid = web::block(move || 
            user_register(
                &data.name, &data.email.to_ascii_lowercase(), &data.password, &conn
              )
            ).await
            .map_err(|e| {
                eprintln!("{}", e);
                HttpResponse::InternalServerError().finish()
            })?;

        Ok(HttpResponse::NoContent().finish())

    }else{
        Ok(HttpResponse::BadRequest().finish())
    }
    
}


#[derive(Serialize, Deserialize)]
pub struct ResetPasswordParams {
    pub password: String,
    pub confirm_password: String,
}

pub async fn reset_password_form(id: Identity, hb: web::Data<Handlebars<'_>>) -> HttpResponse {
    if id.identity().is_some() {
        let data = json!({
            "title": "Reset Password"
          , "parent" : "main"
          , "logged_in" : true
        });
        let body = hb.render("content/reset-password", &data).unwrap();

        HttpResponse::Ok().body(body)
    }else{
        HttpResponse::Found().header("location", "/login").finish()
    }
}

pub async fn reset_password_action(
    id: Identity
  , pool: web::Data<DbPool>
  , data: web::Form<ResetPasswordParams>
 ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    if let Some(sess) = id.identity() {
       
       let sess : UserSession = serde_json::from_str(&sess)?;

       if sess.is_authorized() {
           if data.password.len() > 8 &&
              data.password == data.confirm_password {

                  web::block(move || 
                    user_update_password_by_uuid(
                        *sess.uuid(), &data.password, &conn
                      )
                    ).await
                    .map_err(|e| {
                        eprintln!("{}", e);
                        HttpResponse::InternalServerError().finish()
                    })?;

                Ok(HttpResponse::Found().header("location", "/reset-password").finish())
           }else {
                Ok(HttpResponse::Found().header("location", "/reset-password").finish())
           }
       }else {
            Ok(HttpResponse::Found().header("location", "/login").finish())
       }
    }else{
        Ok(HttpResponse::Found().header("location", "/login").finish())
    }
}


#[derive(Serialize, Deserialize)]
pub struct VerifyAccountParams {
    pub code: String,
}

pub async fn verify_account_form(
    id: Identity, hb: web::Data<Handlebars<'_>>
 ) -> Result<HttpResponse,actix_web::Error> {
    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        if sess.is_unconfirmed() {
            let data = json!({
                "title": "Verify Account"
              , "parent" : "main"
              , "logged_in" : true
            });
            let body = hb.render("content/verify-account", &data).unwrap();

            Ok(HttpResponse::Ok().body(body))
        }else {
            Ok(HttpResponse::Found().header("location", "/manage-account").finish())
        }
    }else{
        Ok(HttpResponse::Found().header("location", "/login").finish())
    }
}

pub async fn verify_account_action(
    id: Identity
  , pool: web::Data<DbPool>
  , data: web::Form<VerifyAccountParams>
 ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");
    
    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        if sess.is_unconfirmed() {
            let uuid = *sess.uuid();
            let verified = web::block(move || 
                user_verify_by_uuid(
                    uuid, &data.code, &conn
                  )
                ).await
                .map_err(|e| {
                    eprintln!("{}", e);
                    HttpResponse::InternalServerError().finish()
                })?;

              if verified {
                let sess0 = UserSession::Authorized(*sess.uuid(),vec![]);
                id.remember(serde_json::to_string(&sess0)?);
                Ok(HttpResponse::Found().header("location", "/manage-account").finish())
              }else {
                Ok(HttpResponse::Found().header("location", "/verify-account").finish())
              }
        }else{
            Ok(HttpResponse::Found().header("location", "/manage-account").finish())
        }
    }else{
        Ok(HttpResponse::Found().header("location", "/login").finish())
    }
}

pub async fn verify_account_action_json(
    id: Identity
  , pool: web::Data<DbPool>
  , data: web::Form<VerifyAccountParams>
 ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");
    
    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        if sess.is_unconfirmed() {
          let uuid0 = *sess.uuid(); 
          let verified = web::block(move || 
            user_verify_by_uuid(
                uuid0, &data.code, &conn
              )
            ).await
            .map_err(|e| {
                eprintln!("{}", e);
                HttpResponse::InternalServerError().finish()
            })?;

          if verified {
            let sess0 = UserSession::Authorized(*sess.uuid(),vec![]);
            id.remember(serde_json::to_string(&sess0)?);
            Ok(HttpResponse::NoContent().finish())
          }else {
            Ok(HttpResponse::BadRequest().finish())
          }
        }else{
            Ok(HttpResponse::NoContent().finish())
        }
    }else{
        Ok(HttpResponse::Unauthorized().finish())
    }
}

// TODO: We need some form of nonce or recaptcha for this one

#[derive(Serialize, Deserialize)]
pub struct RecoverPasswordParams {
    pub email: String,
}

pub async fn recover_password_form(id: Identity, hb: web::Data<Handlebars<'_>>) -> HttpResponse {
    if id.identity().is_none() {
        let data = json!({
            "title": "Recover Password"
          , "parent" : "main"
          , "logged_in" : false
        });
        let body = hb.render("content/recover-password", &data).unwrap();

        HttpResponse::Ok().body(body)
    }else{
        HttpResponse::Found().header("location", "/reset-password").finish()
    }
}

pub fn send_validation_email( user : models::User ) 
    -> Result<lettre::transport::smtp::response::Response, lettre::transport::smtp::error::Error> {

    let from = std::env::var("EMAIL_NOREPLY").expect("EMAIL_NOREPLY");
    let reply_to = std::env::var("EMAIL_REPLY_TO").expect("EMAIL_REPLY_TO");
    let smtp_host = std::env::var("SMTP_HOST").expect("SMTP_HOST");
    let smtp_username = std::env::var("SMTP_USERNAME").expect("SMTP_USERNAME");
    let smtp_password = std::env::var("SMTP_PASSWORD").expect("SMTP_PASSWORD");

    let body = 
        format!("Hello {},\n\nYour verification code is {}.", user.name, user.code.unwrap()); 

    let email = Message::builder()
        .from(from.parse().unwrap())
        .reply_to(reply_to.parse().unwrap())
        .to(user.email.parse().unwrap())
        .subject("Verify Your Account")
        .body(body)
        .unwrap();

    let creds = Credentials::new(smtp_username.to_string(), smtp_password.to_string());

    // Open a remote connection to gmail
    let mailer = SmtpTransport::relay(&smtp_host)
        .unwrap()
        .credentials(creds)
        .build();

    // Send the email
    mailer.send(&email) 
}

#[derive(Debug)]
pub enum RecoverPasswordError {
    DbError, EmailError 
}

pub async fn recover_password_action(
    pool: web::Data<DbPool>
  , data: web::Form<RecoverPasswordParams>
 ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    if email_is_valid( &data.email ) { 
        web::block(move || {
            let is_acct = 
                user_update_code_by_email(
                    &data.email, &conn
                  ).map_err(|e| {
                      eprintln!("{}", e);
                      RecoverPasswordError::DbError
                  })?;
        
            // Watch out for timing attacks.  They could know
            // when they found a user by request duration
            // ALSO: this blocks a long time before erroring out!
            if is_acct {
                let user 
                    = user_by_email( &data.email, &conn )
                       .map_err(|e| {
                           eprintln!("{}", e);
                           RecoverPasswordError::DbError
                       })?.unwrap();

                send_validation_email(user)
                    .map_err(|e| {
                        eprintln!("{}", e);
                        RecoverPasswordError::EmailError
                    })?;
            }
            Ok::<(),RecoverPasswordError>(()) 
        }).await
            .map_err(|e| {
                eprintln!("{}", e);
                HttpResponse::InternalServerError().finish()
            })?;


        Ok(HttpResponse::Found().header("location", "/recover-password").finish())
    } else {
        Ok(HttpResponse::Found().header("location", "/recover-password").finish())
    }
}

pub async fn recover_password_action_json(
    pool: web::Data<DbPool>
  , data: web::Json<RecoverPasswordParams>
 ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    if email_is_valid( &data.email ) { 
        web::block(move || {
            let is_acct = 
                user_update_code_by_email(
                    &data.email, &conn
                  ).map_err(|e| {
                      eprintln!("{}", e);
                      RecoverPasswordError::DbError
                  })?;
        
            // Watch out for timing attacks.  They could know
            // when they found a user by request duration
            // ALSO: this blocks a long time before erroring out!
            // TODO: Another actor should be responsible for sending
            // emails.

            if is_acct {
                let user 
                    = user_by_email( &data.email, &conn )
                       .map_err(|e| {
                           eprintln!("{}", e);
                           RecoverPasswordError::DbError
                       })?.unwrap();

                send_validation_email(user)
                    .map_err(|e| {
                        eprintln!("{}", e);
                        RecoverPasswordError::EmailError
                    })?;
            }
            // We don't want an indicator of whether or not the account
            // exists
            Ok::<(),RecoverPasswordError>(()) 
        }).await
            .map_err(|e| {
                eprintln!("{}", e);
                HttpResponse::InternalServerError().finish()
            })?;

        // Do not indicate whether or not the email refers to an account

        Ok(HttpResponse::NoContent().finish())
    }else {
        Ok(HttpResponse::BadRequest().finish())
    }
}

pub async fn user_update_password_json(
    id: Identity
  , pool: web::Data<DbPool>
  , data: web::Json<String>
 ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    if let Some(sess) = id.identity() {
       let sess : UserSession = serde_json::from_str(&sess)?;
       if sess.is_authorized() {
           if data.len() > 8 {
                  let uuid0 = *sess.uuid(); 
                  web::block(move || 
                    user_update_password_by_uuid(
                        uuid0, &data, &conn
                      )
                    ).await
                    .map_err(|e| {
                        eprintln!("{}", e);
                        HttpResponse::InternalServerError().finish()
                    })?;

                Ok(HttpResponse::NoContent().finish())
           }else {
                Ok(HttpResponse::BadRequest().finish())
           }
       }else{
            Ok(HttpResponse::Forbidden().finish())
       }
    }else{
        Ok(HttpResponse::Unauthorized().finish())
    }
}

#[derive(Serialize,Deserialize)]
pub struct UserPublic {
    pub name: String,
    pub email: String,
    pub uuid: Uuid,
    pub permissions: i32,
    pub created: NaiveDateTime, 
    pub updated: NaiveDateTime, 
}

pub async fn user_by_login_json(
    id: Identity
  , pool: web::Data<DbPool>
 ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        if sess.is_authorized() {
            let uuid0 = *sess.uuid();
            let user =
              web::block(move || 
                user_by_uuid(
                    uuid0, &conn
                  )
                ).await
                .map_err(|e| {
                    eprintln!("{}", e);
                    HttpResponse::InternalServerError().finish()
                })?.unwrap();

            Ok(HttpResponse::Ok().json(UserPublic {
                name : user.name
              , email : user.email
              , uuid : uuid0
              , permissions : user.permissions
              , created: user.created
              , updated : user.updated
            }))
        }else{
            Ok(HttpResponse::Forbidden().finish())
        }
    }else{
        Ok(HttpResponse::Unauthorized().finish())
    }
}

pub async fn user_name_by_login_json(
    id: Identity
  , pool: web::Data<DbPool>
 ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        if sess.is_authorized() {
            let uuid0 = *sess.uuid();
            let user =
              web::block(move || 
                user_by_uuid(
                    uuid0, &conn
                  )
                ).await
                .map_err(|e| {
                    eprintln!("{}", e);
                    HttpResponse::InternalServerError().finish()
                })?.unwrap();

            Ok(HttpResponse::Ok().json(user.name))
        }else{
            Ok(HttpResponse::Forbidden().finish())
        }
    }else{
        Ok(HttpResponse::Unauthorized().finish())
    }
}

pub async fn user_update_name_by_login_json(
    id: Identity
  , name : web::Json<String>
  , pool: web::Data<DbPool>
 ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        if sess.is_authorized() {
            if name.len() > 0 {
                let uuid0 = *sess.uuid();
                let _user =
                  web::block(move || 
                    user_update_name_by_uuid(
                        uuid0, &name, &conn
                      )
                    ).await
                    .map_err(|e| {
                        eprintln!("{}", e);
                        HttpResponse::InternalServerError().finish()
                    })?;

                user_name_by_login_json(id,pool).await
            }else{
                Ok(HttpResponse::BadRequest().finish())
            }
        }else{
            Ok(HttpResponse::Forbidden().finish())
        }
    }else{
        Ok(HttpResponse::Unauthorized().finish())
    }
}

pub async fn user_email_by_login_json(
    id: Identity
  , pool: web::Data<DbPool>
 ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    if let Some(sess) = id.identity() {
        let sess : UserSession = serde_json::from_str(&sess)?;
        if sess.is_authorized() {
            let uuid0 = *sess.uuid(); 
            let user =
              web::block(move || 
                user_by_uuid(
                    uuid0, &conn
                  )
                ).await
                .map_err(|e| {
                    eprintln!("{}", e);
                    HttpResponse::InternalServerError().finish()
                })?.unwrap();

            Ok(HttpResponse::Ok().json(user.email))
        }else{
            Ok(HttpResponse::Forbidden().finish())
        }
    }else{
        Ok(HttpResponse::Unauthorized().finish())
    }
}

pub async fn manage_account(id: Identity) -> String {
    format!(
        "Hello {}",
        id.identity().unwrap_or_else(|| "Anonymous".to_owned())
    )
}

/// Allow logout to support system simulation
pub async fn logout(
    id: Identity
 ) -> Result<HttpResponse,actix_web::Error> {
    if let Some(sess) = id.identity() {
        let mut sess : UserSession = serde_json::from_str(&sess)?;
        if sess.is_simulated() {
            sess.simulate_pop();
            id.remember(serde_json::to_string(&sess)?);
            Ok(HttpResponse::Found().header("location", "/manage-account").finish())
        }else{
            id.forget();
            Ok(HttpResponse::Found().header("location", "/").finish())
        }
    }else {
        Ok(HttpResponse::Found().header("location", "/").finish())
    }
}

/// Allow logout to support system simulation
pub async fn logout_json(
    id: Identity
 ) -> Result<HttpResponse,actix_web::Error> {
    if let Some(sess) = id.identity() {
        let mut sess : UserSession = serde_json::from_str(&sess)?;
        if sess.is_simulated() {
            sess.simulate_pop();
            id.remember(serde_json::to_string(&sess)?);
        }else{
            id.forget();
        }
        Ok(HttpResponse::NoContent().finish())
    }else {
        Ok(HttpResponse::Unauthorized().finish())
    }
}

pub fn users_api_json( cfg: &mut web::ServiceConfig ) {
    cfg
    .service(web::resource("/verify-account")
        .route(web::post().to(verify_account_action_json))
    )
    .service(web::resource("/recover-password")
        .route(web::post().to(recover_password_action_json))
    )
    .service(web::resource("/register")
        .route(web::post().to(register_action_json))
    )
    .service(web::resource("/logout").to(logout_json))
    .service(web::resource("/login")
            .route(web::post().to(login_action_json))
    )
    .service(web::resource("/user")
        .route(web::get().to(user_by_login_json))
    )
    .service(web::resource("/user/name")
        .route(web::get().to(user_name_by_login_json))
        .route(web::post().to(user_update_name_by_login_json))
        .route(web::put().to(user_update_name_by_login_json))
    )
    .service(web::resource("/user/email")
        .route(web::get().to(user_email_by_login_json))
    )
    .service(web::resource("/user/password")
        .route(web::post().to(user_update_password_json))
    );
}

pub fn users_api( cfg: &mut web::ServiceConfig ) {
    cfg
    .service(web::resource("/verify-account")
        .route(web::get().to(verify_account_form))
        .route(web::post().to(verify_account_action))
    )
    .service(web::resource("/reset-password")
        .route(web::get().to(reset_password_form))
        .route(web::post().to(reset_password_action))
     )
    .service(web::resource("/recover-password")
        .route(web::get().to(recover_password_form))
        .route(web::post().to(recover_password_action))
    )
    .service(web::resource("/manage-account")
        .route(web::get().to(manage_account))
    )
    .service(web::resource("/register")
        .route(web::get().to(register_form))
        .route(web::post().to(register_action))
    )
    .service(web::resource("/logout").to(logout))
    .service(web::resource("/login")
            .route(web::post().to(login_action))
            .route(web::get().to(login_form))
    );
}
