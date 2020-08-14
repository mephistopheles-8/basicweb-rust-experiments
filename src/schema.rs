table! {
    locations (id) {
        id -> Integer,
        name -> Text,
        description -> Nullable<Text>,
        address -> Nullable<Text>,
        city -> Nullable<Text>,
        region -> Nullable<Text>,
        postal -> Nullable<Text>,
        country -> Nullable<Text>,
        lat -> Double,
        lng -> Double,
        uuid -> Binary,
        created -> Timestamp,
        updated -> Timestamp,
    }
}
