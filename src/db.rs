use diesel::prelude::*;
use diesel::r2d2::{self, ConnectionManager};

pub type Connection = SqliteConnection;
pub type DbPool = r2d2::Pool<ConnectionManager<Connection>>;

use diesel::connection::SimpleConnection;
use std::time::Duration;

#[derive(Debug)]
pub struct ConnectionOptions {
    pub enable_foreign_keys: bool,
    pub enable_wal_mode: bool,
    pub busy_timeout: Option<Duration>,
}

impl ConnectionOptions {
    pub fn apply(&self, conn: &SqliteConnection) -> QueryResult<()> {
        if self.enable_foreign_keys {
            conn.batch_execute("PRAGMA foreign_keys = ON;")?;
        }
        if self.enable_wal_mode {
            conn.batch_execute("PRAGMA journal_mode = WAL;")?;
            conn.batch_execute("PRAGMA synchronous = NORMAL;")?;
        }
        if let Some(duration) = self.busy_timeout {
            conn.batch_execute(&format!("PRAGMA busy_timeout = {};", duration.as_millis()))?;
        }
        Ok(())
    }
}

impl Default for ConnectionOptions {
    fn default() -> Self {
        Self {
            enable_foreign_keys: true,
            enable_wal_mode: true,
            busy_timeout: Some(Duration::from_secs(60)),
        }
    }
}

impl diesel::r2d2::CustomizeConnection<SqliteConnection, diesel::r2d2::Error>
    for ConnectionOptions
{
    fn on_acquire(&self, conn: &mut SqliteConnection) -> Result<(), diesel::r2d2::Error> {
        self.apply(conn).map_err(diesel::r2d2::Error::QueryError)
    }
}



