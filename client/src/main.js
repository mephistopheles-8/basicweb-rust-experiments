import Board from "./Board.html"

export default {
    board( target, props ){ 
        return  new Board({target,props}); 
    }
}
