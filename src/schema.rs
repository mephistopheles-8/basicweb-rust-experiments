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
    secret_questions (id) {
        id -> Integer,
        question -> Text,
        active -> Bool,
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

allow_tables_to_appear_in_same_query!(
    items,
    posts,
    secret_questions,
    users,
);
