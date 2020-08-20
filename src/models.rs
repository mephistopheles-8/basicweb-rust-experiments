
use super::schema::*;
use chrono::NaiveDateTime;
use uuid::Uuid;
use serde::{de,ser, Serialize, Deserialize, Deserializer, Serializer};

fn uuid_serialize<S>(v:&Vec<u8>,serializer:S) 
    -> Result<S::Ok, S::Error>
    where S: Serializer
{
    let mut buf = [b'!'; 40];
    let uuid = 
        Uuid::from_slice(v.as_slice())
        .map_err(ser::Error::custom)?
        .to_hyphenated()
        .encode_lower(&mut buf);

    serializer.serialize_str(&uuid)
}


fn uuid_deserialize<'de, D>(deserializer: D) -> Result<Vec<u8>, D::Error>
    where D: Deserializer<'de>
{
    let s = String::deserialize(deserializer)?;
    let uuid = Uuid::parse_str(&s).map_err(de::Error::custom)?;
    Ok(uuid.as_bytes().to_vec())
}



#[derive(Queryable,Identifiable,Serialize,Deserialize)]
#[table_name = "galleries"]
pub struct Gallery {
    pub id: i32,
    pub kind: i32,
    pub name: String,
    pub description: String,
    #[serde(serialize_with="uuid_serialize",deserialize_with="uuid_deserialize")]
    pub uuid: Vec<u8>,
    pub created: NaiveDateTime,
    pub updated: NaiveDateTime, 
}

#[derive(AsChangeset,Serialize,Deserialize)]
#[table_name = "galleries"]
pub struct GalleryPost {
    pub kind: i32,
    pub name: String,
    pub description: String,
}

#[derive(Insertable)]
#[table_name = "galleries"]
pub struct NewGallery<'a> {
    pub kind: i32,
    pub name: &'a str,
    pub description: &'a str,
    pub uuid: &'a [u8],
}

#[derive(Queryable,Identifiable,Serialize,Deserialize)]
#[table_name = "gallery_items"]
pub struct GalleryItem {
    pub id: i32,
    pub gallery: i32,
    pub resource: i32,
    pub kind: i32,
    pub name: String,
    pub description: String,
    #[serde(serialize_with="uuid_serialize",deserialize_with="uuid_deserialize")]
    pub uuid: Vec<u8>,
    pub created: NaiveDateTime, 
    pub updated: NaiveDateTime, 
}

#[derive(AsChangeset,Serialize,Deserialize)]
#[table_name = "gallery_items"]
pub struct GalleryItemPost {
    pub name : String,
    pub description : String,
    pub kind : i32,
}

#[derive(Insertable)]
#[table_name = "gallery_items"]
pub struct NewGalleryItem<'a> {
    pub gallery: i32,
    pub resource: i32,
    pub kind: i32,
    pub name: &'a str,
    pub description: &'a str,
    pub uuid: &'a [u8],
}

#[derive(Queryable,Identifiable,Serialize,Deserialize)]
#[table_name = "resources"]
pub struct Resource {
    pub id: i32,
    pub filepath: String,
    pub kind: i32,
    #[serde(serialize_with="uuid_serialize",deserialize_with="uuid_deserialize")]
    pub uuid: Vec<u8>,
    pub created: NaiveDateTime, 
    pub updated: NaiveDateTime, 
}

#[derive(Insertable)]
#[table_name = "resources"]
pub struct NewResource<'a> {
    pub filepath: &'a str,
    pub kind: i32,
    pub uuid: &'a [u8],
}

