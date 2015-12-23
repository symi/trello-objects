'use strict';

let trello,
    Checklist;

class Card {
    constructor(card) {
        this._card = card;
        this.name = card.name;
        this.id = card.id;
        this.url = card.url;
        this._boardId = card.idBoard;
        this._listId = card.idList
        this._checklists = undefined; 
        this._description = card.desc;         
    }
    
    *getDescription() {
        return this._description;
    }
    
    *setDescription(description) {
        this._description = description;
        yield trello.put(`${this.id}/desc`, {
            value: description
        });
    }
    
    *getChecklists(recursive) {
        if (!Array.isArray(this._checklists)) {
            this._checklists = yield* Checklist.getAll(this.id, recursive);
        } 
            
        return this._checklists;               
    }
    
    *getOrAddChecklist(name) {
        yield* this.getChecklists();
        let checklist = yield* Checklist.getOrAdd(this.id, name),
            found = this._checklists.find(c => checklist.id === c.id);
        
        if (found) {
            return found;
        } else {
            this._checklists.push(checklist);
            return checklist;
        }
    }
    
    static *getOrAdd(listId, name, recursive) {
        let card = yield* Card.get(listId, name, recursive);
        
        if (!card) {
            card = yield* Card.add(listId, name);
        }
        
        return card;
    }
    
    static *get(listId, name, recursive) {
        let cards = yield* Card.getAll(listId),
            card = cards.find(card => card.name === name);
        
        if (recursive && card) yield* card.getChecklists(recursive);
        
        return card;        
    }
    
    static *add(listId, name) {
        let card = yield trello.post('', {
            name,
            idList: listId
        });
        return new Card(card);
    }
    
    static *getAll(listId, recursive) {
        let cards = yield trello.request('get', `lists/${listId}/cards`, {
            filter: 'open'
        });
        
        return cards
            .map(c => {
                let card = new Card(c);               
                if (recursive) card.getChecklists(recursive);
                return card;
            });
    }
    
    static getBulk(bulkData) {
        return bulkData.cards.map(c => {
            let card = new Card(c);
            card._checklists = Checklist.getBulk({
                checklists: c.checklists
            });            
            return card;
        });
    }
}

module.exports = function (TrelloAPI, checklist) {
    trello = new TrelloAPI(Card);
    Checklist = checklist;
    return Card;
};