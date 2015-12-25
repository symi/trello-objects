'use strict';

let trello;

class Member {
    constructor(member) {
        this._member = member;
        this.name = member.fullName;
        this.id = member.id;
        this.username = member.username;
    }
    
    get raw() {
        return this._member;
    }
    
    static getBulk(bulkData) {
        return bulkData.members.map(m => new Member(m));
    }
}

module.exports = function (TrelloAPI) {
    trello = new TrelloAPI(Member);
    return Member;
};