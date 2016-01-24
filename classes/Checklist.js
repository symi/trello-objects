'use strict';

let trello,
    CheckItem;

class Checklist {
    constructor(checklist) {
        this._checklist = checklist;
        this.name = checklist.name;
        this.id = checklist.id;
        this._boardId = checklist.idBoard;
        this._cardId = checklist.idCard;
        this._checkItems = CheckItem.getBulk({
            checkItems: checklist.checkItems
        });        
        this._position = checklist.pos;    
    }
    
    get raw() {
        return this._checklist;
    }
    
    getPosition() {
        return this._position;
    }
    
    *setPosition(position) {
        this._position = position;
        return yield trello.put(`${this.id}/pos`, {
            value: this._position
        });
    }
        
    *getCheckItems() {
        if (!Array.isArray(this._checkItems)) {
            this._checkItems = yield* CheckItem.getAll(this.id);
        }
        
        return this._checkItems;          
    }
    
    *getOrAddCheckItem(name, position) {
        yield* this.getCheckItems();
        let checkItem = yield* CheckItem.getOrAdd(this.id, name, position),
            found = this._checkItems.find(c => checkItem.id === c.id);
        
        if (found) {
            return found;
        } else {
            this._checkItems.push(checkItem);
            return checkItem;
        }
    }
    
    static *getOrAdd(cardId, name, recursive) {
        let checklist = yield* Checklist.get(cardId, name, recursive);
        
        if (!checklist) {
            checklist = yield* Checklist.add(cardId, name);
        }
        
        return checklist;
    }
    
    static *get(cardId, name, recursive) {
        let checklists = yield* Checklist.getAll(cardId),
            checklist = checklists.find(checklist => checklist.name === name);
        
        if (recursive && checklist) yield* checklist.getCheckItems();
        
        return checklist;        
    }
    
    static *add(cardId, name) {
        let checklist = yield trello.post('', {
            name,
            idCard: cardId
        });
        return new Checklist(checklist);
    }
    
    static *getAll(cardId, recursive) {
        let checklists = yield trello.request('get', `cards/${cardId}/checklists`);
        
        return checklists
            .map(c => {
                let checklist = new Checklist(c);               
                if (recursive) checklist.getCheckItems();
                return checklist;
            });          
    }
    
    static getBulk(bulkData) {
        if (!Array.isArray(bulkData.checklists)) return;
        return bulkData.checklists.map(c => new Checklist(c));
    }
}

module.exports = function (TrelloAPI, checkItem) {
    trello = new TrelloAPI(Checklist);
    CheckItem = checkItem;
    return Checklist;
};