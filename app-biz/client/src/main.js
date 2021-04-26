import GalleryCreate from "./GalleryCreate.html"
import Gallery from "./Gallery.html"
import Board from "./Board.html"
import PostMarkdown from "./PostMarkdown.html"
import MapSearch from "./MapSearch.html"
import MapListing from "./MapListing.html"
import LocationCreate from "./LocationCreate.html"
import LocationByDistance from "./LocationByDistance.html"
import Leaflet from "leaflet";
import CreditCardForm from "./CreditCardForm.html"

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
    },
    locationByDistance( target, props ){ 
        return  new LocationByDistance({target,props}); 
    },
    gallery( target, props ){ 
        return  new Gallery({target,props}); 
    },
    galleryCreate( target, props ){ 
        return  new GalleryCreate({target,props});
    },
    board( target, props ){ 
        return  new Board({target,props});
    },
    postMarkdown( target, props ){ 
        return  new PostMarkdown({target,props}); 
    },
    creditCardForm( target, props ){ 
        return  new CreditCardForm({target,props}); 
    }
}
