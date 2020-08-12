#[macro_use]
extern crate diesel;

#[macro_use]
extern crate serde_json;

use actix_identity::Identity;
use actix_identity::{CookieIdentityPolicy, IdentityService};
use actix_web::{middleware, web, App, HttpRequest, HttpResponse, HttpServer};
use lettre::{Message, SmtpTransport, Transport};
use rand::Rng;
use diesel::prelude::*;
use diesel::r2d2::{self, ConnectionManager};

use handlebars::Handlebars;

mod schema;
mod models;

async fn index(id: Identity, hb: web::Data<Handlebars<'_>>) -> HttpResponse {
    let data = json!({
        "title": "Welcome"
      , "parent" : "main"
      , "logged_in" : id.identity().is_some()
    });
    let body = hb.render("content/index", &data).unwrap();

    HttpResponse::Ok().body(body)
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

async fn register_form(id: Identity, hb: web::Data<Handlebars<'_>>) -> HttpResponse {
    let data = json!({
        "title": "Register"
      , "parent" : "main"
      , "logged_in" : id.identity().is_some()
    });
    let body = hb.render("content/register", &data).unwrap();

    HttpResponse::Ok().body(body)
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

async fn manage_account(id: Identity) -> String {
    format!(
        "Hello {}",
        id.identity().unwrap_or_else(|| "Anonymous".to_owned())
    )
}

async fn login(id: Identity) -> HttpResponse {
    id.remember("user1".to_owned());
    HttpResponse::Found().header("location", "/").finish()
}

async fn logout(id: Identity) -> HttpResponse {
    id.forget();
    HttpResponse::Found().header("location", "/").finish()
}

fn send_email() {
    let email = Message::builder()
        .from("NoBody <nobody@domain.tld>".parse().unwrap())
        .reply_to("Yuin <yuin@domain.tld>".parse().unwrap())
        .to("Hei <hei@domain.tld>".parse().unwrap())
        .subject("Happy new year")
        .body("Be happy!")
        .unwrap();

    // Open a local connection on port 25
    let mailer = SmtpTransport::unencrypted_localhost();

    // Send the email
    match mailer.send(&email) {
        Ok(_) => println!("Email sent successfully!"),
        Err(e) => panic!("Could not send email: {:?}", e),
    }
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
            )
            .service(web::resource("/reset-password")
                .route(web::get().to(reset_password_form))
             )
            .service(web::resource("/recover-password")
                .route(web::get().to(recover_password_form))
            )
            .service(web::resource("/manage-account")
                .route(web::get().to(manage_account))
            )
            .service(web::resource("/register")
                .route(web::get().to(register_form))
            )
            .service(web::resource("/logout").to(logout))
            .service(web::resource("/login")
                    .route(web::post().to(login))
                    .route(web::get().to(login_form))
            )
            .service(web::resource("/").route(web::get().to(index)))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
