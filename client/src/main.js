import GalleryCreate from "./GalleryCreate.html"
import UserGalleryCreate from "./UserGalleryCreate.html"
import Gallery from "./Gallery.html"
import UserGallery from "./UserGallery.html"
import UserGalleryList from "./UserGalleryList.html"
import UserGalleryItemList from "./UserGalleryItemList.html"
import Board from "./Board.html"
import PostMarkdown from "./PostMarkdown.html"
import UserPost from "./UserPost.html"
import UserPostList from "./UserPostList.html"
import Tags from "./Tags.html"

export default {
    gallery( target, props ){ 
        return  new Gallery({target,props}); 
    },
    userGallery( target, props ){ 
        return  new UserGallery({target,props}); 
    },
    galleryCreate( target, props ){ 
        return  new GalleryCreate({target,props});
    },
    userGalleryCreate( target, props ){ 
        return  new UserGalleryCreate({target,props});
    },
    userGalleryList( target, props ){ 
        return  new UserGalleryList({target,props});
    },
    userGalleryItemList( target, props ){ 
        return  new UserGalleryItemList({target,props});
    },
    board( target, props ){ 
        return  new Board({target,props});
    },
    postMarkdown( target, props ){ 
        return  new PostMarkdown({target,props}); 
    },
    userPost( target, props ){ 
        return  new UserPost({target,props}); 
    },
    userPostList( target, props ){ 
        return  new UserPostList({target,props});
    },
    tags( target, props ){ 
        return  new Tags({target,props});
    }
}
