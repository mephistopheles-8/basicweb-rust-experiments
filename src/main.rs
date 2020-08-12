#[macro_use]
extern crate diesel;

#[macro_use]
extern crate serde_json;

use actix_identity::Identity;
use actix_identity::{CookieIdentityPolicy, IdentityService};
use actix_web::{middleware, web, App, HttpResponse, HttpServer};
use diesel::prelude::*;
use diesel::r2d2::{self, ConnectionManager};
use argon2::{self, Config};
use lettre::transport::smtp::authentication::Credentials;
use lettre::{Message, SmtpTransport, Transport};



use handlebars::Handlebars;
use rand::Rng;
use regex::Regex;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

mod schema;
mod models;

type DbPool = r2d2::Pool<ConnectionManager<SqliteConnection>>;

// Taken from w3c html5 spec
// https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
const EMAIL_REGEXP : &str  = r"^[a-zA-Z0-9.!#$%&'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";

async fn index(id: Identity, hb: web::Data<Handlebars<'_>>) -> HttpResponse {
    let data = json!({
        "title": "Welcome"
      , "parent" : "main"
      , "logged_in" : id.identity().is_some()
    });
    let body = hb.render("content/index", &data).unwrap();

    HttpResponse::Ok().body(body)
}

#[derive(Serialize, Deserialize)]
pub struct LoginParams {
    email: String,
    password: String,
}

async fn login_form(id: Identity, hb: web::Data<Handlebars<'_>>) -> HttpResponse {
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

fn user_by_email(
    email0 : &str
  , conn: &SqliteConnection 
) -> Result<Option<models::User>, diesel::result::Error> {
    use crate::schema::users::dsl::*;
    let user = users
        .filter(email.eq(email0))
        .first::<models::User>(conn)
        .optional()?;
    Ok(user)
}

fn user_by_uuid(
    uuid0 : Uuid  
  , conn: &SqliteConnection 
) -> Result<Option<models::User>, diesel::result::Error> {
    use crate::schema::users::dsl::*;
    let user = users
        .filter(uuid.eq(uuid0.as_bytes().to_vec()))
        .first::<models::User>(conn)
        .optional()?;
    Ok(user)
}

fn user_update_password_by_uuid(
    uuid0 : Uuid
  , pw0 : &str
  , conn: &SqliteConnection 
) -> Result<bool, diesel::result::Error> {
    use crate::schema::users::dsl::*;

    let salt = rand::thread_rng().gen::<[u8; 32]>();
    let config = Config::default();
    let hash = argon2::hash_encoded(pw0.as_bytes(), &salt, &config).unwrap();

    let user = users
        .filter(uuid.eq(uuid0.as_bytes().to_vec()));

    let n = diesel::update(user).set(password.eq(hash)).execute(conn)?;
    Ok(n > 0)
}

fn user_update_code_by_email(
    email0 : &str
  , code0 : &str
  , conn: &SqliteConnection 
) -> Result<bool, diesel::result::Error> {
    use crate::schema::users::dsl::*;

    let user = users
        .filter(email.eq(email0));

    let n = diesel::update(user).set(code.eq(code0)).execute(conn)?;
    Ok(n > 0)
}

fn user_verify_by_uuid( 
    uuid0: Uuid
  , code0 : &str
  , conn: &SqliteConnection 
) -> Result<bool, diesel::result::Error> {

    use crate::schema::users::dsl::*;
    let user = user_by_uuid(uuid0, conn)?;

    if let Some(u0) = user {
        if let Some(code1) = u0.code {
            if code0 == code1 {
                let user = users
                    .filter(uuid.eq(uuid0.as_bytes().to_vec()));
                
                // TODO: Fix race-condition

                diesel::update(user).set(permissions.eq(u0.permissions | 1)).execute(conn)?;
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


fn user_by_login( 
    login: &LoginParams
  , conn: &SqliteConnection 
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

fn user_register(
    name0 : &str
  , email0 : &str
  , pw0 : &str
  , conn: &SqliteConnection 
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

async fn login_action(
    id: Identity
  , pool: web::Data<DbPool>
  , data: web::Form<LoginParams>
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
             })?.build().to_hyphenated().to_string();

        id.remember(uuid);
        if user.permissions == 0 {
            Ok(HttpResponse::Found().header("location", "/verify-account").finish())
        }else{
            Ok(HttpResponse::Found().header("location", "/manage-account").finish())
        }

    } else {
        Ok(HttpResponse::Found().header("location", "/login").finish())
    }
}

#[derive(Serialize, Deserialize)]
pub struct RegisterParams {
    name: String,
    email: String,
    password: String,
    confirm_password: String,
}

async fn register_form(id: Identity, hb: web::Data<Handlebars<'_>>) -> HttpResponse {
    let data = json!({
        "title": "Register"
      , "parent" : "main"
      , "logged_in" : id.identity().is_some()
    });
    let body = hb.render("content/register", &data).unwrap();

    HttpResponse::Ok().body(body)
}

async fn register_action(
    id: Identity
  , pool: web::Data<DbPool>
  , data: web::Form<RegisterParams>
 ) -> Result<HttpResponse,actix_web::Error> {

    id.forget();
    
    let re = Regex::new(EMAIL_REGEXP).unwrap();
    let conn = pool.get().expect("couldn't get db connection from pool");
    
    if data.name.len() > 0 &&
       re.is_match(&data.email) &&
       data.password.len() > 8 &&
       data.password == data.confirm_password {

        let uuid = web::block(move || 
            user_register(
                &data.name, &data.email.to_ascii_lowercase(), &data.password, &conn
              )
            ).await
            .map_err(|e| {
                eprintln!("{}", e);
                HttpResponse::InternalServerError().finish()
            })?;
        id.remember(uuid.to_hyphenated().to_string());
        Ok(HttpResponse::Found().header("location", "/verify-account").finish())

    }else{
        Ok(HttpResponse::Found().header("location", "/register").finish())
    }
}

#[derive(Serialize, Deserialize)]
pub struct ResetPasswordParams {
    password: String,
    confirm_password: String,
}

async fn reset_password_form(id: Identity, hb: web::Data<Handlebars<'_>>) -> HttpResponse {
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

async fn reset_password_action(
    id: Identity
  , pool: web::Data<DbPool>
  , data: web::Form<ResetPasswordParams>
 ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    if let Some(uuid) = id.identity() {
        
       if data.password.len() > 8 &&
          data.password == data.confirm_password {
              let uuid0 = Uuid::parse_str(&uuid)
                    .map_err(|e| {
                        eprintln!("{}", e);
                        HttpResponse::InternalServerError().finish()
                    })?;

              web::block(move || 
                user_update_password_by_uuid(
                    uuid0, &data.password, &conn
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
    }else{
        Ok(HttpResponse::Found().header("location", "/login").finish())
    }
}

#[derive(Serialize, Deserialize)]
pub struct VerifyAccountParams {
    code: String,
}

async fn verify_account_form(id: Identity, hb: web::Data<Handlebars<'_>>) -> HttpResponse {
    if id.identity().is_some() {
        let data = json!({
            "title": "Verify Account"
          , "parent" : "main"
          , "logged_in" : true
        });
        let body = hb.render("content/verify-account", &data).unwrap();

        HttpResponse::Ok().body(body)
    }else{
        HttpResponse::Found().header("location", "/login").finish()
    }
}

async fn verify_account_action(
    id: Identity
  , pool: web::Data<DbPool>
  , data: web::Form<VerifyAccountParams>
 ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");
    
    if let Some(uuid) = id.identity() {
          let uuid0 = Uuid::parse_str(&uuid)
                .map_err(|e| {
                    eprintln!("{}", e);
                    HttpResponse::InternalServerError().finish()
                })?;
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
            Ok(HttpResponse::Found().header("location", "/manage-account").finish())
          }else {
            Ok(HttpResponse::Found().header("location", "/verify-account").finish())
          }
    }else{
        Ok(HttpResponse::Found().header("location", "/login").finish())
    }
}

#[derive(Serialize, Deserialize)]
pub struct RecoverPasswordParams {
    email: String,
}

async fn recover_password_form(id: Identity, hb: web::Data<Handlebars<'_>>) -> HttpResponse {
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

fn send_validation_email( user : models::User ) 
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
enum RecoverPasswordError {
    DbError, EmailError 
}

async fn recover_password_action(
    pool: web::Data<DbPool>
  , data: web::Form<RecoverPasswordParams>
 ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // A multiple of 3 bytes typically results in a base64-encoded
    // string with no padding

    let code = rand::thread_rng().gen::<[u8; 9]>();

    let b64 = base64::encode(code);

    web::block(move || {
        let is_acct = 
            user_update_code_by_email(
                &b64, &data.email, &conn
              ).map_err(|_| RecoverPasswordError::DbError)?;
    
        // Watch out for timing attacks.  They could know
        // when they found a user by request duration
        if is_acct {
            let user 
                = user_by_email( &data.email, &conn )
                   .map_err(|_| RecoverPasswordError::DbError)?.unwrap();
            send_validation_email(user)
                .map_err(|_| RecoverPasswordError::EmailError)?;
        }
        Ok::<(),RecoverPasswordError>(()) 
    }).await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;


    Ok(HttpResponse::Found().header("location", "/recover-password").finish())
}

async fn manage_account(id: Identity) -> String {
    format!(
        "Hello {}",
        id.identity().unwrap_or_else(|| "Anonymous".to_owned())
    )
}

async fn logout(id: Identity) -> HttpResponse {
    id.forget();
    HttpResponse::Found().header("location", "/").finish()
}


#[actix_rt::main]
async fn main() -> std::io::Result<()> {
    std::env::set_var("RUST_LOG", "actix_web=info");
    env_logger::init();
    dotenv::dotenv().ok();

    // set up database connection pool
    let connspec = std::env::var("DATABASE_URL").expect("DATABASE_URL");
    let manager = ConnectionManager::<SqliteConnection>::new(connspec);
    let pool = r2d2::Pool::builder()
        .build(manager)
        .expect("Failed to create pool.");

    // Random session private key
    let private_key = rand::thread_rng().gen::<[u8; 32]>();

    // Handlebar templates
    
    let mut handlebars = Handlebars::new();
    handlebars
        .register_templates_directory(".html", "./static/templates")
        .unwrap();
    let handlebars_ref = web::Data::new(handlebars);

    HttpServer::new(move || {
        App::new()
            // db pool
            .data(pool.clone())
            // handlebars
            .app_data(handlebars_ref.clone())
            // identity
            .wrap(IdentityService::new(
                CookieIdentityPolicy::new(&private_key)
                    .name("sessid")
                    .secure(false),
            ))
            // logger (must be last)
            .wrap(middleware::Logger::default())
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
            )
            .service(web::resource("/").route(web::get().to(index)))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
