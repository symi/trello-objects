'use strict';

let trello,
    List;

class Board {
    constructor(board) {
        this._board = board;
        this.name = board.name;
        this.id = board.id;
        this.closed = board.closed;
        this._lists = undefined;          
    }
    
    *getLists(recursive) {
        if (!Array.isArray(this._lists)) {
            this._lists = yield* List.getAll(this.id, recursive);
        }

        return this._lists;         
    }
    
    *addList(name) {
        let list = yield* List.add(this.id, name);
        this._lists.push(list);
        return list;
    }
    
    static *getOrAdd(name, recursive) {
        let board = yield* Board.get(name, recursive);
        
        if (!board) {
            board = yield* Board.add(name);
        }
        
        return board;
    }
    
    static *get(name, recursive) {
        let boards = yield* Board.getAll(),
            board = boards.find(board => board.name === name && !board.closed);
            
        if (!(recursive && board)) return board;
        
        yield* board.getLists(recursive);
        
        return board;
    }
    
    static *add(name) {
        let board = yield trello.post('', {
            name
        });
        return new Board(board);
    }
    
    static *getAll() {
        let boards = yield trello.request({
            baseUrl: trello.baseUrl,
            url: 'members/me/boards'
        });
        
        return boards
            .filter(board => !board.closed)
            .map(board => new Board(board));
    }
    
    static *getBulk(name) {
        let board = yield* Board.get(name),
            bulkData = yield trello.get(board.id, {
                lists: 'open',
                cards: 'open',
                card_checklists: 'all'
            });
        
        board._lists = List.getBulk(bulkData);
        return board;
    }
}

module.exports = function (TrelloAPI, list) {
    trello = new TrelloAPI(Board);
    List = list;
    return Board;
};