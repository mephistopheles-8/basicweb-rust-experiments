use crate::schema::*;
use chrono::NaiveDateTime;
use crate::util::uuid_json;
use serde::{Serialize,Deserialize};


#[derive(Queryable,QueryableByName,Identifiable,Serialize,Deserialize)]
#[table_name = "posts"]
pub struct Post {
    pub id: i32,
    pub parent: Option<i32>,
    pub depth: i32,
    pub title: Option<String>,
    pub description: Option<String>,
    pub body: String,
    pub status: i32,
    pub flagged: bool,
    #[serde(with="uuid_json")]
    pub uuid: Vec<u8>,
    pub created: NaiveDateTime,
    pub updated: NaiveDateTime, 
}

#[derive(Serialize,Deserialize)]
pub struct PostTree {
    pub id: i32,
    pub parent: Option<i32>,
    pub depth: i32,
    pub title: Option<String>,
    pub description: Option<String>,
    pub body: String,
    pub status: i32,
    pub flagged: bool,
    pub replies: Vec<PostTree>,
    #[serde(with="uuid_json")]
    pub uuid: Vec<u8>,
    pub created: NaiveDateTime,
    pub updated: NaiveDateTime, 
}

impl PostTree {
   pub fn from_post( post: Post ) -> Self {
        PostTree {
          id : post.id
        , parent : post.parent
        , depth : post.depth
        , title : post.title
        , description : post.description
        , body : post.body
        , status: post.status
        , flagged: post.flagged
        , replies : vec![]
        , uuid: post.uuid
        , created: post.created
        , updated: post.updated
        }
   }
}

#[derive(AsChangeset,Serialize,Deserialize)]
#[table_name = "posts"]
pub struct PostPost {
    pub title: Option<String>,
    pub description: Option<String>,
    pub body: String,
}

#[derive(Insertable)]
#[table_name = "posts"]
pub struct NewPost<'a> {
    pub parent: Option<i32>,
    pub depth: i32,
    pub title: Option<&'a str>,
    pub description: Option<&'a str>,
    pub body: &'a str,
    pub status: i32,
    pub uuid: &'a [u8],
}

