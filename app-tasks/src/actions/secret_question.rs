
use diesel::prelude::*;
use crate::models;
use crate::db::Connection;

pub fn secret_questions_all( conn: &Connection ) -> Result<Vec<models::SecretQuestion>,diesel::result::Error>{
    use crate::schema::secret_questions::dsl::*;
    let qs = secret_questions
        .filter(active.eq(true))
        .load(conn)?;
    Ok(qs)

}
pub fn secret_question_by_id( id0: i32, conn: &Connection ) -> Result<Option<models::SecretQuestion>,diesel::result::Error>{
    use crate::schema::secret_questions::dsl::*;
    let qs = secret_questions
        .filter(id.eq(id0))
        .first::<models::SecretQuestion>(conn)
        .optional()?;
    Ok(qs)

}
