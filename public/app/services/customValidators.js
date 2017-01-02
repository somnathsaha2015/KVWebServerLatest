"use strict";
var CustomValidators = (function () {
    function CustomValidators() {
    }
    CustomValidators.emailValidator = function (control) {
        if (!control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
            return { 'invalidEmail': true };
        }
    };
    ;
    CustomValidators.usZipCodeValidator = function (control) {
        if (!control.value.match(/(^\d{5}$)|(^\d{5}-\d{4}$)/)) {
            return ({ 'invalidZipCode': true });
        }
    };
    ;
    CustomValidators.pwdComplexityValidator = function (control) {
        /*At least 8 characters in length,
        at least 1 character from 3 out of the 4 following types:
            Lower case
            Upper case
            Number
            Special Character like �!@#$%^&*()�*/
        var ret = null;
        var pwd = control.value;
        if (pwd.length < 8) {
            ret = { 'pwdLengthLt8': true };
        }
        else {
            var hasUpperCase = +/[A-Z]/.test(pwd);
            var hasLowerCase = +/[a-z]/.test(pwd);
            var hasNumbers = +/\d/.test(pwd);
            var hasNonalphas = +/\W/.test(pwd);
            if (hasUpperCase + hasLowerCase + hasNumbers + hasNonalphas < 3) {
                ret = { 'invalidPwd': true };
            }
        }
        return (ret);
    };
    ;
    CustomValidators.phoneValidator = function (control) {
        var ret;
        var international = /^\(?[+]?(\d{1})\)?[- ]?\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
        var domestic = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
        var local = /^\(?(\d{3})\)?[- ]?(\d{4})$/;
        var general = /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/i;
        if (control.value == null) {
            ret = null;
        }
        else if (!(control.value.match(international))
            && (!control.value.match(domestic)
                && (!control.value.match(local)))) {
            ret = { 'invalidPhone': true };
        }
        return (ret);
    };
    ;
    // static usDateValidator(control:FormControl){
    //     let dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
    //     let mDate = control.value.toLocaleString();
    //     if (!mDate.match(dateRegex)){
    //         return{'invalidDate':true};
    //     }
    // }
    CustomValidators.creditCardValidator = function (control) {
        // Visa, MasterCard, American Express, Diners Club, Discover, JCB
        if (control.value.match(/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/)) {
            return null;
        }
        else {
            return { 'invalidCreditCard': true };
        }
    };
    return CustomValidators;
}());
exports.CustomValidators = CustomValidators;
//# sourceMappingURL=customValidators.js.map