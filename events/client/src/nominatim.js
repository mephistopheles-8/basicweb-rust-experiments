
const host = "https://nominatim.openstreetmap.org";

function paramEncode( params ) {
    var ret = "";
    var keys = [];
    for( let key in params ) {
        if( params.hasOwnProperty(key) ) 
           keys.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key])); 
    }
    return keys.join("&");
} // end [paramEncode]

export function search( params ) {
    let paramUri = paramEncode( params );
    return fetch( `${host}/search?${paramUri}` );
} // end [search]

export function reverse( params ) {
    let paramUri = paramEncode( params );
    return fetch( `${host}/reverse?${paramUri}` );
} // end [reverse]

export function lookup( params ) {
    let paramUri = paramEncode( params );
    return fetch( `${host}/lookup?${paramUri}` );
} // end [lookup]

export default {
    search, reverse, lookup
}
