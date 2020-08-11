#[macro_use]
extern crate diesel;
extern crate dotenv;

//use actix_identity::Identity;
use actix_identity::{CookieIdentityPolicy, IdentityService};
use actix_web::{middleware, web, App, HttpRequest, HttpServer};
use rand::Rng;

use diesel::prelude::*;
use diesel::r2d2::{self, ConnectionManager};

mod schema;
mod models;

async fn index(req: HttpRequest) -> &'static str {
    println!("REQ: {:?}", req);
    "Hello world!"
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

    let private_key = rand::thread_rng().gen::<[u8; 32]>();

    HttpServer::new(move || {
        App::new()
            // enable logger
            .data(pool.clone())
            .wrap(IdentityService::new(
                CookieIdentityPolicy::new(&private_key)
                    .name("sessid")
                    .secure(false),
            ))
            .wrap(middleware::Logger::default())
            .service(web::resource("/index.html").to(|| async { "Hello world!" }))
            .service(web::resource("/verify-account").to(index))
            .service(web::resource("/reset-password").to(index))
            .service(web::resource("/recover-password").to(index))
            .service(web::resource("/manage-account").to(index))
            .service(web::resource("/register").to(index))
            .service(web::resource("/logout").to(index))
            .service(web::resource("/login").to(index))
            .service(web::resource("/").to(index))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
