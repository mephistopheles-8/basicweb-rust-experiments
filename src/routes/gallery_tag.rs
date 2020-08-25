
use crate::db::DbPool;
use crate::actions;
use actix_web::{web,HttpResponse};
use uuid::Uuid;

pub async fn gallery_tags_create_json(
     path: web::Path<Uuid>
   , data : web::Json<Vec<String>>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let tags = web::block(move || { 
        let tags = actions::tag::tags_merge(&mut *data.iter().map(|x| &**x).collect::<Vec<&str>>(), &conn)?;
        actions::gallery_tag::gallery_tags_create_by_uuid( *path, &tags, &conn )?;

        Ok::<_,diesel::result::Error>(tags)

    })
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    Ok(HttpResponse::Ok().json(tags))
}

pub async fn gallery_tags_json(
     path: web::Path<Uuid>
   , pool: web::Data<DbPool>
  ) -> Result<HttpResponse,actix_web::Error> {

    let conn = pool.get().expect("couldn't get db connection from pool");

    // use web::block to offload blocking Diesel code without blocking server thread
    let tags = web::block(move || 
        actions::gallery_tag::gallery_tags_by_uuid(*path,&conn)
    )
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    Ok(HttpResponse::Ok().json(tags))
}
