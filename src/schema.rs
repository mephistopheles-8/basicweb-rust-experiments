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
