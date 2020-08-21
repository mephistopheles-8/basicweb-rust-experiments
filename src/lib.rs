
#[macro_use]
extern crate diesel;
#[macro_use]
extern crate serde_json;

pub mod schema;
pub mod models;
pub mod util;
pub mod db;
pub mod actions;
pub mod routes;

pub use routes::post::{api_html,api_v1_json};
