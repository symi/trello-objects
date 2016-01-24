'use strict';

let trello;

class Label {
    constructor(label) {
        this._label = label;
        this._id = label.id;
        this._boardId = label.idBoard;
        this._name = label.name;
        this._colour = label.color;
        this._count = label.uses;
    }
    
    get raw() {
        return this._label;
    }
    
    get id() {
        return this._id;
    }
    
    get name() {
        return this._name;
    }
    
    static getBulk(bulkData) {
        if (!Array.isArray(bulkData.labels)) return;
        return bulkData.labels.map(l => new Label(l));
    }  
}

module.exports = function (TrelloAPI) {
    trello = new TrelloAPI(Label);
    return Label;
};