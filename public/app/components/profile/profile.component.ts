import { Component } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { FormBuilder, Validators, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomValidators } from '../../services/customValidators';
import { AppService } from '../../services/app.service';
import { AlertModule } from 'ng2-bootstrap';
import { ControlMessages } from '../controlMessages/controlMessages.component';
// import { DatepickerModule } from 'ng2-bootstrap';
// import { MyDatePickerModule } from 'mydatepicker/dist/my-date-picker.module';
import { CalendarModule, InputMaskModule, GrowlModule, Message } from 'primeng/primeng';
import { Util } from '../../services/util'
@Component({
    templateUrl: 'app/components/profile/profile.component.html'
})
export class Profile {
    getProfileSubscription: Subscription;
    saveProfileSubscription: Subscription;
    profileForm: FormGroup;
    alert: any = {};
    profile: any = {};
    // myDatePickerOptions: any = {
    //     dateFormat: "mm/dd/yyyy"
    //     , inline: false
    // };
    primeDate: any;
    messages: Message[] = [];
    constructor(private appService: AppService, private fb: FormBuilder) {
        //this.myDatePickerOptions={};
        this.initProfileForm();
        this.getProfileSubscription = appService.filterOn('get:user:profile')
            .subscribe(d => {
                if (d.data.error) {
                    console.log(d.data.error);
                } else {
                    let profileArray = JSON.parse(d.data).Table;
                    if (profileArray.length > 0) {
                        this.profile = profileArray[0];
                    }
                    this.initProfileForm();
                }
            });

        this.saveProfileSubscription = appService.filterOn('post:save:profile')
            .subscribe(d => {
                if (d.data.error) {
                    this.appService.showAlert(this.alert, true, 'dataNotSaved');
                } else {
                    //this.appService.showAlert(this.alert, true, 'dataSaved', 'success');
                    this.messages = [];
                    this.messages.push({
                        severity: 'success'
                        , summary: 'Saved'
                        , detail: 'Data saved successfully'
                    });
                    this.appService.httpGet('get:user:profile');
                }
            });
    };
    ngOnInit() {
        // let token = this.appService.getToken();        
        this.appService.httpGet('get:user:profile');
    };
    onDateChanged(event) {

    };
    initProfileForm() {
        let mDate = Util.convertToUSDate(this.profile.birthDay);
        this.profileForm = this.fb.group({
            firstName: [this.profile.firstName, Validators.required]
            //, lastName: [this.profile.lastName, Validators.required]
            , phone: [this.profile.phone, [Validators.required, CustomValidators.phoneValidator]]
            , birthDay: [mDate, Validators.required]
            , mailingAddress1: [this.profile.mailingAddress1, Validators.required]
            , mailingAddress2: [this.profile.mailingAddress2]
            , mailingCity: [this.profile.mailingCity, Validators.required]
            , mailingState: [this.profile.mailingState, Validators.required]
            , mailingZip: [this.profile.mailingZip, Validators.required]
        });
    };
    getUpdatedProfile() {
        let mDate = Util.getISODate(this.profileForm.controls['birthDay'].value);
        let pr: any = {};
        pr.id = this.profile.id;
        pr.firstName = this.profileForm.controls['firstName'].value;
        //pr.lastName = this.profileForm.controls['lastName'].value;
        pr.phone = this.profileForm.controls['phone'].value;
        pr.birthDay = mDate;
        pr.mailingAddress1 = this.profileForm.controls['mailingAddress1'].value;
        pr.mailingAddress2 = this.profileForm.controls['mailingAddress2'].value;
        pr.mailingCity = this.profileForm.controls['mailingCity'].value;
        pr.mailingState = this.profileForm.controls['mailingState'].value;
        pr.mailingZip = this.profileForm.controls['mailingZip'].value;
        return (pr);
    };
    submit() {
        // this.profile.birthDay = Util.convertToISODate(this.profileForm.controls['birthDay'].value);
        if (this.profileForm.dirty && this.profileForm.valid) {
            this.appService.httpPost('post:save:profile', { profile: this.getUpdatedProfile() });
        }
    }
    ngOnDestroy() {
        this.getProfileSubscription.unsubscribe();
        this.saveProfileSubscription.unsubscribe();
    };
}