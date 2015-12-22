'use strict';

let trello;

class CheckItem {
    constructor(checkItem) {
        this._checklist = checkItem;
        this.name = checkItem.name;
        this.id = checkItem.id;
        this.complete = checkItem.state === 'complete';
        this._position = checkItem.pos;    
    }
    
    *getPosition() {
        return this._position;
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
        let checkItem = yield trello.request({
            baseUrl: trello.baseUrl,
            url: `checklists/${checklistId}/checkItems`,
            method: 'post',
            qs: {
                name,
                pos: position
            }            
        });
        return new CheckItem(checkItem);
    }
    
    static *getAll(checklistId) {
        let checkItems = yield trello.request({
            baseUrl: trello.baseUrl,
            url: `checklists/${checklistId}/checkItems`            
        });
        
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