#[macro_use]
extern crate serde_json;

extern crate app_tasks; 

use app_tasks::min_api;

use actix_files as fs;
use actix_identity::RequestIdentity;
use actix_identity::{CookieIdentityPolicy, IdentityService};
use actix_web::{middleware, web, App, HttpServer};
use actix_http::{body::Body, Response};
use actix_web::dev::ServiceResponse;
use actix_web::http::StatusCode;
use actix_web::middleware::errhandlers::{ErrorHandlerResponse, ErrorHandlers};
use diesel::prelude::*;
use diesel::r2d2::{self, ConnectionManager};

use handlebars::Handlebars;
use rand::Rng;

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
    // Static dir
    let static_dir = std::env::var("STATIC_DIR").expect("STATIC_DIR");

    // Handlebar templates
    
    let mut handlebars = Handlebars::new();
    handlebars
        .register_templates_directory(".html", format!("{}/templates", static_dir))
        .unwrap();
    let handlebars_ref = web::Data::new(handlebars);
    println!("Starting server on port 0.0.0.0:8080");
    HttpServer::new(move || {
        App::new()
            // db pool
            .data(pool.clone())
            // handlebars
            .app_data(handlebars_ref.clone())
            // error handlers
            .wrap(error_handlers())
            // identity (error handlers must be first)
            .wrap(IdentityService::new(
                CookieIdentityPolicy::new(&private_key)
                    .name("sessid")
                    .secure(false),
            ))
            // logger (must be last)
            .wrap(middleware::Logger::default())
            .configure(min_api)
            .service(fs::Files::new("/", format!("{}/root/", static_dir)))
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await
}

// Error logic taken from examples

// Custom error handlers, to return HTML responses when an error occurs.
fn error_handlers() -> ErrorHandlers<Body> {
    ErrorHandlers::new().handler(StatusCode::NOT_FOUND, not_found)
}

// Error handler for a 404 Page not found error.
fn not_found<B>(res: ServiceResponse<B>) -> actix_web::Result<ErrorHandlerResponse<B>> {
    let response = get_error_response(&res, "Page not found");
    Ok(ErrorHandlerResponse::Response(
        res.into_response(response.into_body()),
    ))
}

// Generic error handler.
fn get_error_response<B>(res: &ServiceResponse<B>, error: &str) -> Response<Body> {
    let request = res.request();

    // Provide a fallback to a simple plain text response in case an error occurs during the
    // rendering of the error page.
    let fallback = |e: &str| {
        Response::build(res.status())
            .content_type("text/plain")
            .body(e.to_string())
    };

    let hb = request
        .app_data::<web::Data<Handlebars>>()
        .map(|t| t.get_ref());
   
    let id = request.get_identity();

    match hb {
        Some(hb) => {
            let data = json!({
                "title": error
              , "parent" : "main"
              , "logged_in" : id.is_some()
              , "error": error
              , "status_code": res.status().as_str()
            });
            let body = hb.render("error", &data);

            match body {
                Ok(body) => Response::build(res.status())
                    .content_type("text/html")
                    .body(body),
                Err(_) => fallback(error),
            }
        }
        None => fallback(error),
    }
}
