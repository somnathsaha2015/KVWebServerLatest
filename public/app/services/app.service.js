"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var http_1 = require("@angular/http");
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var subject_1 = require("rxjs/subject");
var observable_1 = require("rxjs/observable");
var behaviorsubject_1 = require("rxjs/behaviorsubject");
// import { Observable, Subject, BehaviorSubject, Observer, Subscription } from 'rxjs/Rx';
require("rxjs/add/operator/map");
require("rxjs/add/observable/of");
require("rxjs/add/operator/filter");
//import * as _ from 'lodash';
var config_1 = require("../config");
var AppService = (function () {
    function AppService(http) {
        // this.spinnerObservable = new Observable(observer => {
        //     this.spinnerObserver = observer;
        // }).share();
        var _this = this;
        this.http = http;
        this.globalSettings = {};
        this.subject = new subject_1.Subject();
        this.behaviorSubjects = {
            'masters:download:success': new behaviorsubject_1.BehaviorSubject({ id: '1', data: {} }),
            'settings:download:success': new behaviorsubject_1.BehaviorSubject({ id: '1', data: {} }),
            'login:page:text': new behaviorsubject_1.BehaviorSubject({ id: 1, data: {} }),
            'spinner:hide:show': new behaviorsubject_1.BehaviorSubject(false)
        };
        this.channel = {};
        this.mastersSubscription = this.filterOn('get:all:masters').subscribe(function (d) {
            if (d.data.error) {
                console.log(d.data.error);
            }
            else {
                var data = JSON.parse(d.data);
                _this.countries = data.Table;
                _this.behEmit('masters:download:success');
            }
        });
        setTimeout(function () {
            _this.httpGet('get:all:masters');
        }, 2000);
        this.settingsSubscription = this.filterOn('get:all:settings').subscribe(function (d) {
            if (d.data.error) {
                console.log(d.data.error);
            }
            else {
                var data = JSON.parse(d.data);
                if (data.Table) {
                    _this.globalSettings.smartyStreetApiKey = data.Table[0].smartyStreetApiKey;
                    _this.globalSettings.smartyStreetAuthId = data.Table[0].smartyStreetAuthId;
                    _this.globalSettings.smartyStreetAuthToken = data.Table[0].smartyStreetAuthToken;
                    _this.globalSettings.creditCardTypes = data.Table[0].creditCardTypes.split(",").map(function (item) {
                        return item.trim();
                    });
                    _this.globalSettings.needHelpText = data.Table1[0].HelpText;
                    _this.globalSettings.onlineOrder = {};
                    //this.globalSettings.onlineOrder.disableOnlineOrderForm = data.Table[0].disableOnlineOrderForm;
                    _this.globalSettings.onlineOrder.disableOnlineOrderText = data.Table[0].disableOnlineOrderText;
                    //this.globalSettings.onlineOrder.minOrderBottles = data.Table[0].minOrderBottles;
                    //this.globalSettings.onlineOrder.minOrderpackages = data.Table[0].minOrderpackages;
                    //this.globalSettings.onlineOrder.welcomeNote = data.Table[0].welcomeNote;
                    _this.globalSettings.loginPage = data.Table1[0].loginPage;
                }
                _this.behEmit('settings:download:success');
            }
        });
    }
    ;
    AppService.prototype.behEmit = function (id, options) {
        this.behaviorSubjects[id].next({ id: id, data: options });
    };
    ;
    AppService.prototype.behFilterOn = function (id) {
        return (this.behaviorSubjects[id]);
    };
    ;
    AppService.prototype.loadSettings = function () {
        if (Object.keys(this.globalSettings).length === 0) {
            var body = {};
            body.data = JSON.stringify({ sqlKey: "GetSiteSettings" });
            this.httpGet('get:all:settings', body);
        }
        else {
            this.behEmit('settings:download:success');
        }
    };
    ;
    AppService.prototype.clearSettings = function () {
        this.globalSettings = {};
    };
    ;
    AppService.prototype.getSetting = function (GlobalSettingsKey) {
        return (this.globalSettings[GlobalSettingsKey]);
    };
    ;
    AppService.prototype.getCountries = function () {
        return (this.countries);
    };
    ;
    AppService.prototype.getMessage = function (messageKey) {
        return (config_1.messages[messageKey]);
    };
    ;
    AppService.prototype.getValidationErrorMessage = function (key) {
        return (config_1.validationErrorMessages[key]);
    };
    ;
    AppService.prototype.setCredential = function (user, token, inactivityTimeoutSecs) {
        var credential = { user: user, token: token, inactivityTimeoutSecs: inactivityTimeoutSecs };
        localStorage.setItem('credential', JSON.stringify(credential));
    };
    ;
    AppService.prototype.getCredential = function () {
        var credentialString = localStorage.getItem('credential');
        var credential;
        if (credentialString) {
            credential = JSON.parse(credentialString);
        }
        return (credential);
    };
    ;
    AppService.prototype.getToken = function () {
        var token = null;
        var credential = this.getCredential();
        if (credential) {
            token = credential.token;
        }
        return (token);
    };
    ;
    AppService.prototype.resetCredential = function () {
        localStorage.removeItem('credential');
    };
    ;
    AppService.prototype.showAlert = function (alert, show, id, type) {
        alert.show = show;
        if (id) {
            alert.message = this.getValidationErrorMessage(id);
            if (!type) {
                type = 'danger';
            }
            alert.type = type;
        }
    };
    ;
    AppService.prototype.httpPost = function (id, body) {
        var _this = this;
        var url = config_1.urlHash[id];
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('x-access-token', this.getToken());
        body.token = this.getToken();
        // if (this.spinnerObserver) { this.spinnerObserver.next(true); }
        this.behEmit('spinner:hide:show', true);
        this.http.post(url, body, { headers: headers })
            .map(function (response) { return response.json(); })
            .subscribe(function (d) {
            _this.subject.next({
                id: id, data: d, body: body
            });
            // if (this.spinnerObserver) { this.spinnerObserver.next(false); }
            _this.behEmit('spinner:hide:show', false);
        }, function (err) {
            _this.subject.next({
                id: id,
                data: { error: err }
            });
            // if (this.spinnerObserver) { this.spinnerObserver.next(false); }
            _this.behEmit('spinner:hide:show', false);
        });
    };
    ;
    AppService.prototype.httpGet = function (id, body) {
        var _this = this;
        var url = config_1.urlHash[id];
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('x-access-token', this.getToken());
        if (body) {
            if (body.id) {
                url = url.replace(':id', body.id);
            }
            if (body.data) {
                headers.append('data', body.data);
            }
            if (body.usAddress) {
                headers.delete('x-access-token');
                url = url.replace(':authId', this.globalSettings.smartyStreetAuthId)
                    .replace(':authToken', this.globalSettings.smartyStreetAuthToken)
                    .replace(':street', encodeURIComponent(body.usAddress.street))
                    .replace(':street2', encodeURIComponent(body.usAddress.street2))
                    .replace(':city', encodeURIComponent(body.usAddress.city))
                    .replace(':state', encodeURIComponent(body.usAddress.state))
                    .replace(':zipcode', encodeURIComponent(body.usAddress.zipcode));
            }
        }
        // if (this.spinnerObserver) { this.spinnerObserver.next(true); }
        this.behEmit('spinner:hide:show', true);
        this.http.get(url, { headers: headers })
            .map(function (response) { return response.json(); })
            .subscribe(function (d) {
            _this.subject.next({
                id: id, data: d
            });
            // if (this.spinnerObserver) { this.spinnerObserver.next(false); }
            _this.behEmit('spinner:hide:show', false);
        }, function (err) {
            _this.subject.next({
                id: id,
                data: { error: err }
            });
            // if (this.spinnerObserver) { this.spinnerObserver.next(false); }
            _this.behEmit('spinner:hide:show', false);
        });
    };
    ;
    AppService.prototype.httpDelete = function (id, body) {
        var _this = this;
        var url = config_1.urlHash[id];
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('x-access-token', this.getToken());
        this.http.delete(url, { headers: headers, body: { id: body.id } })
            .map(function (response) { return response.json(); })
            .subscribe(function (d) {
            return _this.subject.next({
                id: id, data: d, index: body.index
            });
        }, function (err) {
            return _this.subject.next({
                id: id,
                data: { error: err }
            });
        });
    };
    ;
    AppService.prototype.httpPut = function (id, body) {
        var _this = this;
        var url = config_1.urlHash[id];
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('x-access-token', this.getToken());
        body.token = this.getToken();
        this.http.put(url, body, { headers: headers })
            .map(function (response) { return response.json(); })
            .subscribe(function (d) {
            return _this.subject.next({
                id: id, data: d, body: body
            });
        }, function (err) {
            return _this.subject.next({
                id: id,
                data: { error: err }
            });
        });
    };
    ;
    //application wide events
    AppService.prototype.emit = function (id, options) {
        this.subject.next({
            id: id, data: options
        });
    };
    ;
    AppService.prototype.filterOn = function (id) {
        return (this.subject.filter(function (d) { return (d.id === id); }));
    };
    ;
    AppService.prototype.reply = function (key, value) {
        this.channel[key] = value;
    };
    ;
    AppService.prototype.request = function (key, payload) {
        var ret = undefined;
        if (payload) {
            ret = this.channel[key](payload);
        }
        else {
            ret = this.channel[key];
        }
        return (ret);
    };
    ;
    AppService.prototype.reset = function (key) {
        delete this.channel[key];
    };
    ;
    AppService.prototype.resetAllReplies = function () {
        var _this = this;
        Object.keys(this.channel).map(function (key, index) {
            delete _this.channel[key];
        });
    };
    AppService.prototype.encodeBase64 = function (inputString) {
        var Base64 = { _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) { var t = ""; var n, r, i, s, o, u, a; var f = 0; e = Base64._utf8_encode(e); while (f < e.length) {
                n = e.charCodeAt(f++);
                r = e.charCodeAt(f++);
                i = e.charCodeAt(f++);
                s = n >> 2;
                o = (n & 3) << 4 | r >> 4;
                u = (r & 15) << 2 | i >> 6;
                a = i & 63;
                if (isNaN(r)) {
                    u = a = 64;
                }
                else if (isNaN(i)) {
                    a = 64;
                }
                t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a);
            } return t; }, decode: function (e) { var t = ""; var n, r, i; var s, o, u, a; var f = 0; e = e.replace(/[^A-Za-z0-9\+\/\=]/g, ""); while (f < e.length) {
                s = this._keyStr.indexOf(e.charAt(f++));
                o = this._keyStr.indexOf(e.charAt(f++));
                u = this._keyStr.indexOf(e.charAt(f++));
                a = this._keyStr.indexOf(e.charAt(f++));
                n = s << 2 | o >> 4;
                r = (o & 15) << 4 | u >> 2;
                i = (u & 3) << 6 | a;
                t = t + String.fromCharCode(n);
                if (u != 64) {
                    t = t + String.fromCharCode(r);
                }
                if (a != 64) {
                    t = t + String.fromCharCode(i);
                }
            } t = Base64._utf8_decode(t); return t; }, _utf8_encode: function (e) { e = e.replace(/\r\n/g, "\n"); var t = ""; for (var n = 0; n < e.length; n++) {
                var r = e.charCodeAt(n);
                if (r < 128) {
                    t += String.fromCharCode(r);
                }
                else if (r > 127 && r < 2048) {
                    t += String.fromCharCode(r >> 6 | 192);
                    t += String.fromCharCode(r & 63 | 128);
                }
                else {
                    t += String.fromCharCode(r >> 12 | 224);
                    t += String.fromCharCode(r >> 6 & 63 | 128);
                    t += String.fromCharCode(r & 63 | 128);
                }
            } return t; }, _utf8_decode: function (e) { var t = ""; var c1, c2, c3; var n = 0; var r = c1 = c2 = 0; while (n < e.length) {
                r = e.charCodeAt(n);
                if (r < 128) {
                    t += String.fromCharCode(r);
                    n++;
                }
                else if (r > 191 && r < 224) {
                    c2 = e.charCodeAt(n + 1);
                    t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                    n += 2;
                }
                else {
                    c2 = e.charCodeAt(n + 1);
                    c3 = e.charCodeAt(n + 2);
                    t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                    n += 3;
                }
            } return t; } };
        return (Base64.encode(inputString));
    };
    ;
    AppService.prototype.ngOnDestroy = function () {
        this.mastersSubscription.unsubscribe();
        this.settingsSubscription.unsubscribe();
    };
    ;
    return AppService;
}());
AppService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http])
], AppService);
exports.AppService = AppService;
;
var LoginGuard = (function () {
    function LoginGuard(appService, http, router) {
        this.appService = appService;
        this.http = http;
        this.router = router;
    }
    LoginGuard.prototype.canActivate = function (
        // Not using but worth knowing about
        next, state) {
        var ret = false;
        var credential = this.appService.getCredential();
        if (credential) {
            var token = credential.token;
            if (token) {
                ret = this.isLoggedIn(token);
            }
            else {
                this.router.navigate(['/login']);
            }
        }
        return (ret);
    };
    ;
    LoginGuard.prototype.isLoggedIn = function (token) {
        var _this = this;
        //let router: Router = this.router;
        var obs;
        try {
            //let options = new RequestOptions({body:{token:token}});
            var url = config_1.urlHash['post:validate:token'];
            obs = this.http.post(url, { token: token })
                .map(function (result) { return result.json(); });
        }
        catch (err) {
            obs = observable_1.Observable.of(false);
        }
        return obs
            .map(function (success) {
            // navigate to login page
            if (!success) {
                _this.router.navigate(['/login']);
            }
            return success;
        });
    };
    return LoginGuard;
}());
LoginGuard = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [AppService, http_1.Http, router_1.Router])
], LoginGuard);
exports.LoginGuard = LoginGuard;
//# sourceMappingURL=app.service.js.map