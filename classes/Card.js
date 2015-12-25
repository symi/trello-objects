'use strict';

let trello,
    Checklist,
    Label,
    Member;

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
        this._members = undefined;   
    }
    
    get raw() {
        return this._card;
    }
    
    *getList() {
        return yield trello.get(`${this.id}/list`);     
    }
    
    getDescription() {
        return this._description;
    }
    
    *setDescription(description) {
        this._description = description;
        return yield trello.put(`${this.id}/desc`, {
            value: description
        });
    }
    
    *getMembers() {
        if (!Array.isArray(this._members)) {
            let members = yield trello.get(`${this.id}/members`);
            this._members = members.map(m => new Member(m));
        }
        
        return this._members;
    }
    
    *getChecklists(recursive) {
        if (!Array.isArray(this._checklists)) {
            this._checklists = yield* Checklist.getAll(this.id, recursive);
        } 
            
        return this._checklists;               
    }
    
    *getOrAddMember(member) {
        yield* this.getMembers();
        let found = this._members.find(m => member.id === m.id);
        
        if (found) {
            return found;
        } else {
            let m = new Member(yield trello.post(`${this.id}/idMembers`, {
                value: member.id
            })); 
            this._members.push(m);
            return m;
        }
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
        
        if (!(recursive && card)) return card;
        
        yield* card.getChecklists(recursive);
        yield* card.getMembers();
        
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
                if (recursive) {
                    card.getChecklists(recursive);
                    card.getMembers();
                }
                return card;
            });
    }
    
    static getBulk(bulkData) {
        return bulkData.cards.map(c => {
            let card = new Card(c);
            card._checklists = Checklist.getBulk({
                checklists: c.checklists
            });
            card._members = Member.getBulk({
                members: c.members
            });          
            return card;
        });
    }
}

module.exports = function (TrelloAPI, checklist, member, label) {
    trello = new TrelloAPI(Card);
    Checklist = checklist;
    Member = member;
    Label = label;
    return Card;
};