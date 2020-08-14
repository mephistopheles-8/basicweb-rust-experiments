/// This module is for JSON serialization of Vec<u8>
/// to UUID.  This allows for the storage of UUIDs in 
/// a SQLite database as a blob type

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



