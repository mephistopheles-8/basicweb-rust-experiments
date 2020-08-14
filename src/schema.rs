table! {
    galleries (id) {
        id -> Integer,
        kind -> Integer,
        name -> Text,
        description -> Text,
        uuid -> Binary,
        created -> Timestamp,
        updated -> Timestamp,
    }
}

table! {
    gallery_items (id) {
        id -> Integer,
        gallery -> Integer,
        resource -> Integer,
        kind -> Integer,
        name -> Text,
        description -> Text,
        uuid -> Binary,
        created -> Timestamp,
        updated -> Timestamp,
    }
}

table! {
    resources (id) {
        id -> Integer,
        filepath -> Text,
        kind -> Integer,
        uuid -> Binary,
        created -> Timestamp,
        updated -> Timestamp,
    }
}

joinable!(gallery_items -> galleries (gallery));
joinable!(gallery_items -> resources (resource));

allow_tables_to_appear_in_same_query!(
    galleries,
    gallery_items,
    resources,
);
