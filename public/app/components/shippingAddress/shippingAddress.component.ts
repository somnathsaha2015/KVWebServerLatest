import { Component, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { AppService } from '../../services/app.service';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { CustomValidators } from '../../services/customValidators';
import { Modal, ModalModule } from "ng2-modal"
import { AlertModule } from 'ng2-bootstrap/components/alert';
import { ControlMessages } from '../controlMessages/controlMessages.component';
@Component({
    templateUrl: 'app/components/shippingAddress/shippingAddress.component.html'
})
export class ShippingAddress {
    getSubscription: Subscription;
    postSubscription: Subscription;
    putSubscription: Subscription;
    dataReadySubs:Subscription;
    shippingForm: FormGroup;
    alert: any = {};
    countries: [any];
    selectedISOCode: string = '';
    isDataReady:boolean=false;
    @ViewChild('shippingModal') shippingModal: Modal;
    addresses: [{}];
    constructor(private appService: AppService, private fb: FormBuilder) {
        this.initShippingForm();
        this.dataReadySubs=appService.behFilterOn('masters:download:success').subscribe(d=>{
            this.countries = this.appService.getCountries();
            this.isDataReady=true;
        });
        this.getSubscription = appService.filterOn("get:shipping:address")
            .subscribe(d => {
                this.addresses = JSON.parse(d.data).Table;
                console.log(d);
            });
        this.postSubscription = appService.filterOn("post:shipping:address")
            .subscribe(d => {
                if (d.data.error) {
                    this.appService.showAlert(this.alert, true, 'addressSaveFailed');
                } else {
                    this.appService.httpGet('get:shipping:address');
                    this.initShippingForm();
                    this.appService.showAlert(this.alert, false);
                    this.shippingModal.close();
                }
            });
        this.putSubscription = appService.filterOn("put:shipping:address")
            .subscribe(d => {
                if (d.data.error) {
                    this.appService.showAlert(this.alert, true, 'addressSaveFailed');
                } else {
                    this.appService.httpGet('get:shipping:address');
                    this.initShippingForm();
                    this.appService.showAlert(this.alert, false);
                    this.shippingModal.close();
                }
            });
    };
    initShippingForm() {
        this.shippingForm = this.fb.group({
            id: [''],
            co: [''],
            name: ['', Validators.required],
            street1: ['', Validators.required],
            street2: [''],
            city: ['', Validators.required],
            state: [''],
            zip: ['', Validators.required],
            countryName: ['', Validators.required],
            isoCode: [''],
            phone: ['', [Validators.required,CustomValidators.phoneValidator]],
            isDefault: [false]
        });
    }
    ngOnInit() {        
        this.appService.httpGet('get:shipping:address');
    }
    edit(address) {
        this.shippingForm.patchValue({
            id: address.id,
            name: address.name,
            street1: address.street1,
            street2: address.street2,
            city: address.city,
            state: address.state,
            zip: address.zip,
            countryName: address.country,
            isoCode: address.isoCode,
            phone: address.phone,
            isDefault: address.isDefault
        });
        this.selectedISOCode = address.isoCode;
        this.shippingModal.open();
    };
    delete(address) {
        if (confirm('Are you sure to delete this address')) {
            console.log('true');
        } else {
            console.log(false);
        }
    }
    submit() {
        let addr = {
            id: this.shippingForm.controls['id'].value,
            name: this.shippingForm.controls['name'].value,
            street1: this.shippingForm.controls['street1'].value,
            street2: this.shippingForm.controls['street2'].value,
            city: this.shippingForm.controls['city'].value,
            state: this.shippingForm.controls['state'].value,
            zip: this.shippingForm.controls['zip'].value,
            country: '',
            isoCode: '',
            phone: this.shippingForm.controls['phone'].value,
            isDefault: this.shippingForm.controls['isDefault'].value
        };
        addr.isoCode = this.selectedISOCode;
        addr.country = this.countries.filter(d => d.isoCode == this.selectedISOCode)[0].countryName;
        if (addr.id) {
            this.appService.httpPut('put:shipping:address', { address: addr });
        } else {
            this.appService.httpPost('post:shipping:address', { address: addr });
        }
    };
    addAddress() {
        this.initShippingForm();
        this.shippingModal.open();
    };
    cancel() {
        this.appService.showAlert(this.alert, false);
        this.shippingModal.close();
    };
    ngOnDestroy() {
        this.getSubscription.unsubscribe();
        this.postSubscription.unsubscribe();
        this.putSubscription.unsubscribe();
        this.dataReadySubs.unsubscribe();
    };
}