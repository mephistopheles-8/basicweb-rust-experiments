import GalleryCreate from "./GalleryCreate.html"
import UserGalleryCreate from "./UserGalleryCreate.html"
import Gallery from "./Gallery.html"
import Board from "./Board.html"
import PostMarkdown from "./PostMarkdown.html"

export default {
    gallery( target, props ){ 
        return  new Gallery({target,props}); 
    },
    galleryCreate( target, props ){ 
        return  new GalleryCreate({target,props});
    },
    userGalleryCreate( target, props ){ 
        return  new UserGalleryCreate({target,props});
    },
    board( target, props ){ 
        return  new Board({target,props});
    },
    postMarkdown( target, props ){ 
        return  new PostMarkdown({target,props}); 
    }
}
