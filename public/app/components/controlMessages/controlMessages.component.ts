import { Component, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { AppService } from '../../services/app.service';

@Component({
    selector: 'control-messages'
    , template: `<div class='validation' *ngIf="!isValid()">{{errorMessage}}</div>`
    , styles: [`
    .validation { 
        color: #e80c4d;
        font-weight: bold;
        font-size: 1.1em; 
    }`]

})
export class ControlMessages {
    @Input() control: FormControl;
    errorMessage: string;
    constructor(private appService: AppService) { };

    isValid() {
        let ret = true;
        if (this.control.errors) {
            let propertyArray = Object.keys(this.control.errors);
            if ((propertyArray.length > 0) && this.control.touched) {
                ret = false;
                this.errorMessage = this.appService.getValidationErrorMessage(propertyArray[0]);
            }
        }
        return (ret);
    };
}