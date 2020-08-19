import MapSearch from "./MapSearch.html"
import MapListing from "./MapListing.html"
import LocationCreate from "./LocationCreate.html"
import Leaflet from "leaflet";

const L = Leaflet;

export default {
    L,
    icon( opts ) {
        return L.icon( opts );
    },
    iconDefaultImagePath( str ) {
        return L.Icon.Default.prototype.options.imagePath = str;
    },
    mapSearch( target, props ){ 
        return  new MapSearch({target,props}); 
    },
    mapListing( target, props ){ 
        return  new MapListing({target,props}); 
    },
    locationCreate( target, props ){ 
        return  new LocationCreate({target,props}); 
    }
}
