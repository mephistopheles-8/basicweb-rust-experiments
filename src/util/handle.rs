/// For basic handles

pub fn handle_is_valid( h0: &str ) -> bool {

    let mut ret = true;

    for c in h0.chars() {
        if !c.is_ascii_lowercase() &&
           !c.is_ascii_digit() &&
           c != '-' &&
           c != '_' {
            ret = false;
            break;
        }
    }
    ret
}
