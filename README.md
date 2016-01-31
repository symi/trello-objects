#trello-objects
*trello-objects* are a set of domain classes for [Trello](https://trello.com/).
##Introduction
The library contains the majority of domain classes required to interact with a Trello board. 
The library contains methods to incrementally build up local objects from Trello, to recursively build local objects from Trello or to build a whole board's objects in a single bulk Trello API call.

The node requirement for *trello-objects* is v4+ as the library takes advantage of generators for many of it's class methods.
For that reason async methods should be called with `yield*` (see [API docs](https://github.com/symi/trello-objects/blob/master/API.md)). The class libraries are designed to be used via the classes static methods, as these abstract away Trello API calls. 
Direct instantiations of the classes is possible however all domain classes' constructors require the raw json returned from Trello's API.

All Trello API calls are rate limited at the single token rate defined in [this article](http://help.trello.com/article/838-api-rate-limits).

*Note: The library was created with the APIs to cover a personal project, so there maybe areas of the full Trello API which are not implemented.*

##Getting Started
To use *trello-objects* add the npm package to your project.
```
npm i trello-objects
```
You will need to get a Trello API key and token. To allow the full functionality of trello-objects you will need a read/write token. To get your key and token follow the steps: 
 1. Sign in to Trello and navigate to [https://trello.com/app-key](https://trello.com/app-key).
 2. Navigate to https://trello.com/1/connect?key=...&name=MyApp&response_type=token&scope=read,write, substituting your key in.

##Basic Usage
```javascript
const trello = require('trello-objects')(key, token);

let myBoards = yield* trello.Board.getAll();
```
##API
For complete API docs see [API.md](https://github.com/symi/trello-objects/blob/master/API.md).

##Contribution
Feel free to extend, use and contribute to the project! Test coverage should be coming soon. However due to the lack of test coverage, there may be bugs present, please raise an issue or PR.
