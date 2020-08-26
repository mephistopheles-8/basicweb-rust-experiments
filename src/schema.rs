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
    gallery_item_posts (id) {
        id -> Integer,
        gallery_item -> Integer,
        post -> Integer,
        created -> Timestamp,
        updated -> Timestamp,
    }
}

table! {
    gallery_item_tags (id) {
        id -> Integer,
        gallery_item -> Integer,
        tag -> Integer,
        created -> Timestamp,
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
    gallery_posts (id) {
        id -> Integer,
        gallery -> Integer,
        post -> Integer,
        created -> Timestamp,
        updated -> Timestamp,
    }
}

table! {
    gallery_tags (id) {
        id -> Integer,
        gallery -> Integer,
        tag -> Integer,
        created -> Timestamp,
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
    post_tags (id) {
        id -> Integer,
        post -> Integer,
        tag -> Integer,
        created -> Timestamp,
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
        format -> Integer,
        status -> Integer,
        flagged -> Bool,
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
    user_galleries (id) {
        id -> Integer,
        user -> Integer,
        gallery -> Integer,
        permissions -> Integer,
        ord -> Integer,
        url -> Nullable<Text>,
        created -> Timestamp,
        updated -> Timestamp,
    }
}

table! {
    user_gallery_items (id) {
        id -> Integer,
        user -> Integer,
        gallery_item -> Integer,
        permissions -> Integer,
        ord -> Integer,
        url -> Nullable<Text>,
        created -> Timestamp,
        updated -> Timestamp,
    }
}

table! {
    user_posts (id) {
        id -> Integer,
        user -> Integer,
        post -> Integer,
        permissions -> Integer,
        ord -> Integer,
        url -> Nullable<Text>,
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

joinable!(gallery_item_posts -> gallery_items (gallery_item));
joinable!(gallery_item_posts -> posts (post));
joinable!(gallery_item_tags -> gallery_items (gallery_item));
joinable!(gallery_item_tags -> tags (tag));
joinable!(gallery_items -> galleries (gallery));
joinable!(gallery_items -> resources (resource));
joinable!(gallery_posts -> galleries (gallery));
joinable!(gallery_posts -> posts (post));
joinable!(gallery_tags -> galleries (gallery));
joinable!(gallery_tags -> tags (tag));
joinable!(post_tags -> posts (post));
joinable!(post_tags -> tags (tag));
joinable!(tag_bindings -> tags (tag));
joinable!(user_galleries -> galleries (gallery));
joinable!(user_galleries -> users (user));
joinable!(user_gallery_items -> gallery_items (gallery_item));
joinable!(user_gallery_items -> users (user));
joinable!(user_posts -> posts (post));
joinable!(user_posts -> users (user));

allow_tables_to_appear_in_same_query!(
    galleries,
    gallery_item_posts,
    gallery_item_tags,
    gallery_items,
    gallery_posts,
    gallery_tags,
    items,
    post_tags,
    posts,
    resources,
    secret_questions,
    tag_bindings,
    tags,
    user_galleries,
    user_gallery_items,
    user_posts,
    users,
);
