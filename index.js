'use strict';

const TrelloAPI = require('./classes/TrelloAPI'),
    classes = {};
    
function trelloObjects (key, token) {
    TrelloAPI.key = key;
    TrelloAPI.token = token;
    
    classes.Label = require('./classes/Label')(TrelloAPI);   
    classes.Member = require('./classes/Member')(TrelloAPI);
    classes.CheckItem = require('./classes/CheckItem')(TrelloAPI);
    classes.Checklist = require('./classes/Checklist')(TrelloAPI, classes.CheckItem);
    classes.Card = require('./classes/Card')(TrelloAPI, classes.Checklist, classes.Member, classes.Label);
    classes.List = require('./classes/List')(TrelloAPI, classes.Card);
    classes.Board = require('./classes/Board')(TrelloAPI, classes.List, classes.Member, classes.Label);
        
    return classes;
}

module.exports = trelloObjects;