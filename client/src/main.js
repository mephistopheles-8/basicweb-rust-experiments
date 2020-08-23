import GalleryCreate from "./GalleryCreate.html"
import Gallery from "./Gallery.html"
import Board from "./Board.html"

export default {
    gallery( target, props ){ 
        return  new Gallery({target,props}); 
    },
    galleryCreate( target, props ){ 
        return  new GalleryCreate({target,props});
    },
    board( target, props ){ 
        return  new Board({target,props});
    }
}
