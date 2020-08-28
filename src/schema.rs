table! {
    events (id) {
        id -> Integer,
        location -> Integer,
        name -> Text,
        description -> Nullable<Text>,
        start_time -> Timestamp,
        end_time -> Timestamp,
        timezone -> Text,
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

joinable!(events -> locations (location));

allow_tables_to_appear_in_same_query!(
    events,
    locations,
);
