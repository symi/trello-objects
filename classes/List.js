'use strict';

let trello,
    Card;

class List {
    constructor(list) {
        this._list = list;
        this.name = list.name;
        this.id = list.id;
        this._boardId = list.idBoard;
        this._cards = undefined;          
    }
    
    get raw() {
        return this._list;
    }
    
    *getCards(recursive) {
        if (!Array.isArray(this._cards)) {
            this._cards = yield* Card.getAll(this.id, recursive);            
        } 
        
        return this._cards;         
    }
    
    *getOrAddCard(name) {
        yield* this.getCards();
        let card = yield* Card.getOrAdd(this.id, name),
            found = this._cards.find(c => card.id === c.id);
        
        if (found) {
            return found;
        } else {
            this._cards.push(card);
            return card;
        }
    }
    
    static *getOrAdd(boardId, name, recursive) {
        let list = yield* List.get(boardId, name, recursive);
        
        if (!list) {
            list = yield* List.add(boardId, name);
        }
        
        return list;
    }
    
    static *get(boardId, name, recursive) {
        let lists = yield* List.getAll(boardId),
            list = lists.find(list => list.name === name);
        
        if (recursive && list) yield* list.getCards(recursive);
        
        return list;
    }
    
    static *add(boardId, name) {
        let list = yield trello.post('', { 
            name,
            idBoard: boardId
        });
        return new List(list);
    }
    
    static *getAll(boardId, recursive) {
        let lists = yield trello.request('get', `boards/${boardId}/lists`, {
                filter: 'open'
            });
        
        return lists
            .map(l => {
                let list = new List(l);               
                if (recursive) list.getCards(recursive);
                return list;
            });
    }
    
    static getBulk(bulkData) {
        return bulkData.lists.map(l => {
            let list = new List(l);
            list._cards = Card.getBulk({
                cards: bulkData.cards.filter(c => c.idList === list.id)
            });            
            return list;
        });
    }
}

module.exports = function (TrelloAPI, card) {
    trello = new TrelloAPI(List);
    Card = card;
    return List;
};