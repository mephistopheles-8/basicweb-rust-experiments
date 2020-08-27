import Board from "./Board.html"
import PostMarkdown from "./PostMarkdown.html"
export default {
    board( target, props ){ 
        return  new Board({target,props}); 
    },
    postMarkdown( target, props ){ 
        return  new PostMarkdown({target,props}); 
    }
}
