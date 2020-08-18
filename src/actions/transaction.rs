
use diesel::prelude::*;
use crate::db::Connection;
use crate::models;
use uuid::Uuid;


pub fn transaction_create( 
        product0: i32, transaction0: &models::TransactionPost, conn: &Connection 
    ) -> Result<Uuid, diesel::result::Error> {

    use crate::schema::transactions::dsl::*;

    let uuid0 = Uuid::new_v4();

    let new_transaction = models::NewTransaction {
        product: product0,
        txn_code: &transaction0.txn_code,
        name: transaction0.name.as_deref(),
        address: transaction0.address.as_deref(),
        city: transaction0.city.as_deref(),
        region: transaction0.region.as_deref(),
        country: transaction0.country.as_deref(),
        postal: transaction0.postal.as_deref(),
        email: transaction0.email.as_deref(),
        phone: transaction0.phone.as_deref(),
        last4: transaction0.last4.as_deref(),
        payment_method: transaction0.payment_method.as_deref(),
        amount_int: transaction0.amount_int,
        amount_frac: transaction0.amount_frac,
        currency: &transaction0.currency,
        uuid: uuid0.as_bytes(),
    };

    diesel::insert_into(transactions).values(&new_transaction).execute(conn)?;
    Ok(uuid0)
}

pub fn transactions_all ( conn: &Connection ) 
    -> Result<Vec<models::Transaction>, diesel::result::Error> {

    use crate::schema::transactions::dsl::*;
    let g0s = transactions.order_by(name).load( conn )?; 
    Ok(g0s)
}

pub fn transaction_by_id ( id0: i32, conn: &Connection ) 
    -> Result<Option<models::Transaction>, diesel::result::Error> {

    use crate::schema::transactions::dsl::*;
    let g0s = transactions
             .filter(id.eq(id0))
             .first::<models::Transaction>( conn )
             .optional()?; 
    Ok(g0s)
}

pub fn transaction_by_uuid ( uuid0: Uuid, conn: &Connection ) 
    -> Result<Option<models::Transaction>, diesel::result::Error> {

    use crate::schema::transactions::dsl::*;
    let g0s = transactions
              .filter(uuid.eq(uuid0.as_bytes().as_ref()))
              .first::<models::Transaction>( conn )
              .optional()?; 
    Ok(g0s)
}

