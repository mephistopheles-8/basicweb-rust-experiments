table! {
    tag_bindings (id) {
        id -> Integer,
        kind -> Integer,
        item_id -> Integer,
        tag -> Integer,
        created -> Timestamp,
    }
}

table! {
    tags (id) {
        id -> Integer,
        name -> Text,
        created -> Timestamp,
    }
}

joinable!(tag_bindings -> tags (tag));

allow_tables_to_appear_in_same_query!(
    tag_bindings,
    tags,
);
