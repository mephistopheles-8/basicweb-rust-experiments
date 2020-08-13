table! {
    users (id) {
        id -> Integer,
        name -> Text,
        email -> Text,
        password -> Text,
        uuid -> Binary,
        code -> Nullable<Text>,
        permissions -> Integer,
        created -> Timestamp,
        updated -> Timestamp,
    }
}
