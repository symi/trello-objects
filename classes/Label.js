'use strict';

let trello;

class Label {
    constructor(label) {
        this._label = label;
    }
    
    get raw() {
        return this._label;
    }    
}

module.exports = function (TrelloAPI) {
    trello = new TrelloAPI(Label);
    return Label;
};