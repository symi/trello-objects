'use strict';

let trello,
    List,
    Member,
    Label;

class Board {
    constructor(board) {
        this._board = board;
        this.name = board.name;
        this.id = board.id;
        this.closed = board.closed;
        this._lists = undefined; 
        this._members = undefined;
        this._labels = undefined;     
    }
    
    get raw() {
        return this._board;
    }
    
    *getMembers() {
        if (Array.isArray(this._members)) return this._members;
        
        if (Array.isArray(this._board.members)) {
            this._members = this._board.members.map(m => new Member(m));
        } else {
            let members = yield trello.get(`${this.id}/members`);
            this._members = members.map(m => new Member(m));
        }
        
        return this._members;
    }
    
    *getLabels() {
        if (Array.isArray(this._labels)) return this._labels;
        
        if (Array.isArray(this._board.labels)) {
            this._labels = this._board.labels.map(l => new Label(l));
        } else {
            let labels = yield trello.get(`${this.id}/labels`);
            this._labels = labels.map(l => new Label(l));
        }
        
        return this._labels;
    }
    
    *getLists(recursive) {
        if (!Array.isArray(this._lists)) {
            this._lists = yield* List.getAll(this.id, recursive);
        }

        return this._lists;         
    }
    
    *getOrAddList(name) {
        yield* this.getLists();
        let list = yield* List.getOrAdd(this.id, name),
            found = this._lists.find(l => list.id === l.id);
        
        if (found) {
            return found;
        } else {
            this._lists.push(list);
            return list;
        }        
    }
    
    *iterateAllCards(callbackFn, context) {        
        for (let l of yield* this.getLists()) {
            for (let c of yield* l.getCards()) {
                callbackFn.call(context, c);
            }
        }
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
        yield* board.getMembers();
        yield* board.getLabels();
        
        return board;
    }
    
    static *add(name) {
        let board = yield trello.post('', {
            name
        });
        return new Board(board);
    }
    
    static *getAll() {
        let boards = yield trello.request('get', 'members/me/boards');
        
        return boards
            .filter(board => !board.closed)
            .map(board => new Board(board));
    }
    
    static *getBulk(name) {
        let board = yield* Board.getOrAdd(name),
            bulkData = yield trello.get(board.id, {
                lists: 'open',
                cards: 'open',
                card_checklists: 'all',                
                members: 'all',
                labels: 'all'
            });               
        
        // because the bulk board get only returns memberIds for cards, not full member objects
        bulkData.cards.forEach(c => {
            c.members = new Array();
            c.idMembers.forEach(memberId => {
                let member = bulkData.members.find(m => m.id === memberId);
                if (member) {
                    c.members.push(member);
                }  
            });                
        });
        
        board._members = Member.getBulk({
            members: bulkData.members
        });
        
        board._lables = Label.getBulk({
            labels: bulkData.labels
        });
        
        board._lists = List.getBulk(bulkData);
        
        return board;
    }
}

module.exports = function (TrelloAPI, list, member, label) {
    trello = new TrelloAPI(Board);
    List = list;
    Member = member;
    Label = label;
    return Board;
};
