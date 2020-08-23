table! {
    catalogs (id) {
        id -> Integer,
        name -> Text,
        description -> Nullable<Text>,
        kind -> Integer,
        status -> Integer,
        uuid -> Binary,
        created -> Timestamp,
        updated -> Timestamp,
    }
}

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
    items (id) {
        id -> Integer,
        name -> Text,
        description -> Nullable<Text>,
        uuid -> Binary,
        created -> Timestamp,
        updated -> Timestamp,
    }
}

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

table! {
    posts (id) {
        id -> Integer,
        parent -> Nullable<Integer>,
        depth -> Integer,
        title -> Nullable<Text>,
        description -> Nullable<Text>,
        body -> Text,
        status -> Integer,
        flagged -> Bool,
        uuid -> Binary,
        created -> Timestamp,
        updated -> Timestamp,
    }
}

table! {
    products (id) {
        id -> Integer,
        catalog -> Integer,
        name -> Text,
        description -> Nullable<Text>,
        price_int -> Integer,
        price_frac -> Integer,
        currency -> Text,
        status -> Integer,
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
        mime -> Text,
        uuid -> Binary,
        created -> Timestamp,
        updated -> Timestamp,
    }
}

table! {
    secret_questions (id) {
        id -> Integer,
        question -> Text,
        active -> Bool,
    }
}

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

table! {
    transactions (id) {
        id -> Integer,
        product -> Integer,
        txn_code -> Text,
        name -> Nullable<Text>,
        address -> Nullable<Text>,
        city -> Nullable<Text>,
        region -> Nullable<Text>,
        country -> Nullable<Text>,
        postal -> Nullable<Text>,
        email -> Nullable<Text>,
        phone -> Nullable<Text>,
        last4 -> Nullable<Text>,
        payment_method -> Nullable<Text>,
        amount_int -> Integer,
        amount_frac -> Integer,
        currency -> Text,
        uuid -> Binary,
        created -> Timestamp,
        updated -> Timestamp,
    }
}

table! {
    users (id) {
        id -> Integer,
        name -> Text,
        email -> Text,
        handle -> Nullable<Text>,
        password -> Text,
        secret0_question -> Integer,
        secret0_answer -> Text,
        secret1_question -> Integer,
        secret1_answer -> Text,
        secret2_question -> Integer,
        secret2_answer -> Text,
        uuid -> Binary,
        code -> Nullable<Text>,
        pubkey -> Nullable<Text>,
        permissions -> Integer,
        created -> Timestamp,
        updated -> Timestamp,
    }
}

joinable!(gallery_items -> galleries (gallery));
joinable!(gallery_items -> resources (resource));
joinable!(products -> catalogs (catalog));
joinable!(tag_bindings -> tags (tag));
joinable!(transactions -> products (product));

allow_tables_to_appear_in_same_query!(
    catalogs,
    galleries,
    gallery_items,
    items,
    locations,
    posts,
    products,
    resources,
    secret_questions,
    tag_bindings,
    tags,
    transactions,
    users,
);
