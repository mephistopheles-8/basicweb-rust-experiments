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

joinable!(products -> catalogs (catalog));
joinable!(transactions -> products (product));

allow_tables_to_appear_in_same_query!(
    catalogs,
    products,
    transactions,
);
