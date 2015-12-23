'use strict';

const rp = require('request-promise'),
    limiter = require('simple-rate-limiter'),
    baseUrl = 'https://api.trello.com/1/',
    interval = 10000,
    rate = 100;
    
let key,
    token;
    
function limit(defaultedRp) {
    let limitedRequest = limiter(defaultedRp).to(rate).per(interval);
        
    return function (options) {
        return new Promise(function(resolve, reject) {
            limitedRequest(options)
                .on('limiter-exec', function (promise) {
                    resolve(promise);
                }); 
        });
    };
}

function defaultUrl(url) {
    return (url == null || url === '') ? '/' : url;
}

class TrelloAPI {
    constructor(type) {
        this.type = `${type.name.toLowerCase()}s`;
        this._request = limit(rp.defaults({
            baseUrl: `${baseUrl}${this.type}/`,
            qs: {
                key, token
            },
            json: true
        }));
    }
       
    static get key() {
        return key;
    }
    
    static set key(value) {
        key = value;
    }
    
    static get token() {
        return token;
    }
    
    static set token(value) {
        token = value;
    }
    
    *request(method, url, options) {        
        return yield this._request(Object.assign({}, {
            baseUrl,
            method,
            url
        }, { qs: options }));
    }
    
    *get(url, options) {
        url = defaultUrl(url);
        return yield this._request({
            method: 'get',
            url,
            qs: options,
        });
    }
    
    *put(url, options) {
        url = defaultUrl(url);
        return yield this._request({
            method: 'put',
            url,
            qs: options,
        });
    }
    
    *post(url, options) {
        url = defaultUrl(url);
        return yield this._request({
            method: 'post',
            url,
            qs: options,
        });
    }
    
    *delete(url, options) {
        url = defaultUrl(url);
        return yield this._request({
            method: 'delete',
            url,
            qs: options,
        });
    }
}

module.exports = TrelloAPI;