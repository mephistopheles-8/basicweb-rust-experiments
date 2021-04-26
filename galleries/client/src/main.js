import GalleryCreate from "./GalleryCreate.html"
import Gallery from "./Gallery.html"

export default {
    gallery( target, props ){ 
        return  new Gallery({target,props}); 
    },
    galleryCreate( target, props ){ 
        return  new GalleryCreate({target,props}); 
    }
}
