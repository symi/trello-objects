'use strict';

let trello;

class CheckItem {
    constructor(checkItem) {
        this._checkItem = checkItem;
        this.name = checkItem.name;
        this.id = checkItem.id;
        this.complete = checkItem.state === 'complete';
        this._position = checkItem.pos;    
    }
    
    get raw() {
        return this._checkItem;
    }
    
    getPosition() {
        return this._position;
    }
    
    // why does the checkItem not have an idChecklist property!
    *remove(checklistId) {
        return yield trello.request('delete', `checklists/${checklistId}/checkItems/${this.id}`);
    }
    
    static *getOrAdd(checklistId, name) {
        let checkItem = yield* CheckItem.get(checklistId, name);
        
        if (!checkItem) {
            checkItem = yield* CheckItem.add(checklistId, name);
        }
        
        return checkItem;
    }
    
    static *get(checklistId, name) {
        let checkItems = yield* CheckItem.getAll(checklistId);
        
        return checkItems.find(checkItem => checkItem.name === name);        
    }
    
    static *add(checklistId, name, position) {
        let checkItem = yield trello.request('post', `checklists/${checklistId}/checkItems`, {
                name,
                pos: position
            });
        return new CheckItem(checkItem);
    }
    
    static *getAll(checklistId) {
        let checkItems = yield trello.request('get', `checklists/${checklistId}/checkItems`);
        
        return checkItems
            .map(c => new CheckItem(c));   
    }
    
    static getBulk(bulkData) {
        return bulkData.checkItems.map(c => new CheckItem(c));
    }
}

module.exports = function (TrelloAPI) {
    trello = new TrelloAPI(CheckItem);
    return CheckItem;
};