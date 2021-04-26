/// Validate password
/// Here, we provide some override in the case
/// that the user supplies a pretty long password
/// that doesn't meet all criteria.

const PW_THRESH : f32 = 16.0;
const PW_MIN_LEN : usize = 8;

pub fn password_is_valid( pw0: &str ) -> bool {

    let len = pw0.len();

    let mut has_digit = false;
    let mut has_lowercase = false;
    let mut has_uppercase = false;
    let mut has_special = false;

    for c in pw0.chars() {
        if c.is_ascii_digit() {
            has_digit = true;
        }
        if c.is_ascii_punctuation() {
            has_special = true;
        }
        if c.is_lowercase() {
            has_lowercase = true;
        }
        if c.is_uppercase() {
            has_uppercase = true;
        }
    }

    let etest 
        = (((has_digit as i32) 
          + (has_lowercase as i32)
          + (has_uppercase as i32)
          + (has_special as i32)
           ) as f32
          ).log2()*( pw0.len() as f32);

    len >= PW_MIN_LEN && 
    (etest >= PW_THRESH ||
        (has_digit && has_lowercase && has_uppercase && has_special)
    )
}
