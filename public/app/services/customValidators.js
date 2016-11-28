"use strict";
var CustomValidators = (function () {
    function CustomValidators() {
    }
    CustomValidators.emailValidator = function (control) {
        if (!control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
            return { 'invalidEmail': true };
        }
    };
    return CustomValidators;
}());
exports.CustomValidators = CustomValidators;
//# sourceMappingURL=customValidators.js.map