import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/subscription';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { CustomValidators } from '../../services/customValidators';
import { AppService } from '../../services/app.service';
import { viewBoxConfig } from '../../config';
import { md5 } from '../../vendor/md5';
import { AlertModule } from 'ng2-bootstrap';
import { ControlMessages } from '../controlMessages/controlMessages.component';

@Component({
    templateUrl: 'app/components/login/login.component.html'
    , styles: [`
        .ng-valid {
          border: 1px solid #42A948;
        }
        .ng-invalid {
            border: 1px solid #a94442;
        }
    `]
})
export class Login {
    alert: any = {
        show: false,
        type: 'danger',
        message: this.appService.getValidationErrorMessage('loginFailed')
    }
    subscription: Subscription;
    loginFormChangesSubscription: Subscription;
    loginForm: FormGroup;
    constructor(private appService: AppService, private router: Router, private fb: FormBuilder) {
        this.loginForm = fb.group({
            email: ['', [Validators.required, CustomValidators.emailValidator]]
            , password: ['', Validators.required]
        });
        this.subscription = appService.filterOn('post:authenticate')
            .subscribe(d => {
                console.log(d);
                if (d.data.error) {
                    console.log(d.data.error.status)
                    appService.resetCredential();
                    this.alert.show = true;
                } else {
                    console.log('token:' + d.data.token);
                    this.alert.show = false;
                    this.appService.setCredential(this.loginForm.controls["email"].value, d.data.token);
                    this.router.navigate(['order']);
                }
            });
    };
    authenticate(pwd) {
        if (this.loginForm.valid) {
            let base64Encoded = this.appService.encodeBase64(this.loginForm.controls["email"].value + ':' + md5(pwd));
            console.log('md5:' + md5(pwd));
            console.log(base64Encoded);
            this.appService.httpPost('post:authenticate', { auth: base64Encoded });
        }
        else {
            this.alert.show = true;
        }
    };
    logout() {
        this.appService.resetCredential();
        this.router.navigate(['/login']);
    }

    ngOnInit() {
        this.loginFormChangesSubscription = this.loginForm.valueChanges.subscribe(x => {
            this.alert.show = false;
        });
    }
    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.loginFormChangesSubscription.unsubscribe();
    }
}
