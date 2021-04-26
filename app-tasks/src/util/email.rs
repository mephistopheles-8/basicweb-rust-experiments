
use regex::Regex;

// Taken from w3c html5 spec
// https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address

const EMAIL_REGEXP : &str  = r"^[a-zA-Z0-9.!#$%&'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";

pub fn email_is_valid(email: &str) -> bool {
    let re = Regex::new(EMAIL_REGEXP).unwrap();
    re.is_match(email)
}
