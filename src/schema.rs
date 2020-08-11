table! {
    users (id) {
        id -> Nullable<Integer>,
        name -> Text,
        email -> Text,
        password -> Binary,
        uuid -> Binary,
        permissions -> Integer,
    }
}
