
#[macro_use]
extern crate diesel;
#[macro_use]
extern crate serde_json;

pub mod models;
pub mod schema;
pub mod util;
pub mod routes;
pub mod actions;
pub mod db;

pub use routes::location::locations_api;
