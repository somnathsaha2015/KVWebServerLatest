import { Component, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/subscription';
import { Location } from '@angular/common';
//import { ActivatedRoute } from '@angular/router';
//import { ModalDirective } from 'ng2-bootstrap/ng2-bootstrap';
import { AppService } from '../../services/app.service';
import { Router } from '@angular/router';
import { messages } from '../../config';
import { ModalModule, Modal } from "ng2-modal";
import { AlertModule } from 'ng2-bootstrap';
@Component({
    templateUrl: 'app/components/approveOrder/approveOrder.component.html'
})
export class ApproveOrder {
    approveArtifactsSub: Subscription;
    postApproveSubscription:Subscription;
    selectedAddress: any = {};
    selectedCard: any = {};
    allTotals: {} = {};
    footer: any = {
        wineTotals: {
            wine: 0.00, addl: 0.00
        },
        salesTaxPerc: 0.00,
        shippingCharges: 0.00,
        shippingTotals: { wine: 0.00/1, addl: 0.00/1 },
        prevBalances: { wine: 0.00/1, addl: 0.00/1 },
        grandTotals: { wine: 0.00/1, addl: 0.00/1 },
        salesTaxTotals: { wine: 0.00/1, addl: 0.00/1 }
    };
    allAddrSubscription: Subscription;
    allCardSubscription: Subscription;

    approveHeading: string = messages['mess:approve:heading'];

    allAddresses: [any] = [{}];
    allCards: [any] = [{}];
    orders: any[];
    //orderBundle: any = {};
    isAlert: boolean;
    alert: any = { type: "success" };


    constructor(private appService: AppService, private location: Location, private router: Router) {
        let ords = appService.request('orders');
        if(!ords){
            router.navigate(['order']);
        }
        this.postApproveSubscription = appService.filterOn('post:save:approve:request').subscribe(d=>{
            if(d.data.error){
                console.log(d.data.error);
            } else{
                this.appService.reset('orders');
                this.router.navigate(['receipt']);
            }
        });
        this.approveArtifactsSub = appService.filterOn('get:approve:artifacts').subscribe(d => {
            if (d.data.error) {
                console.log(d.data.error);
            } else {
                let artifacts = JSON.parse(d.data);
                if (artifacts.Table.length > 0) {
                    this.selectedCard = artifacts.Table[0];
                } else {
                    this.selectedCard = null;
                }
                if (artifacts.Table1.length > 0) {
                    this.selectedAddress = artifacts.Table1[0];
                } else {
                    this.selectedAddress = null;
                }
                if (artifacts.Table2.length > 0) {
                    this.footer.prevBalance = artifacts.Table2[0] / 1;
                    this.footer.prevBalances = { wine: artifacts.Table2[0].prevBalanceWine, addl: artifacts.Table2[0].prevBalanceAddl }
                } else {
                    this.footer.prevBalances = { wine: 0.00, addl: 0.00 };
                }
            }
            this.computeTotals();
        });
        this.allAddrSubscription = appService.filterOn('get:all:shipping:addresses').subscribe(d => {
            if (d.data.error) {
                console.log(d.data.error);
            } else {
                this.allAddresses = JSON.parse(d.data).Table;
            }
        });
        this.allCardSubscription = appService.filterOn('get:all:credit:cards').subscribe(d => {
            if (d.data.error) {
                console.log(d.data.error);
            } else {
                this.allCards = JSON.parse(d.data).Table;
            }
        });

    };
    @ViewChild('addrModal') addrModal: Modal;
    changeSelectedAddress() {
        this.isAlert = false;
        this.appService.httpGet('get:all:shipping:addresses');
        this.addrModal.open();
    };
    selectAddress(address) {
        this.selectedAddress = address;
        this.addrModal.close();
    };

    @ViewChild('cardModal') cardModal: Modal;
    changeSelectedCard() {
        this.appService.httpGet('get:all:credit:cards');
        this.cardModal.open();
    };
    selectCard(card) {
        this.selectedCard = card;
        this.cardModal.close();
    };

    editWineRequest() {
        this.router.navigate(['order']);
        //this.location.back();
    };
    approve() {
        let orderBundle:any={};
        orderBundle.orderMaster = {
            MDate:new Date(),
            TotalPriceWine: this.footer.wineTotals.wine/1,
            TotalPriceAddl: this.footer.wineTotals.addl/1,
            SalesTaxWine: this.footer.salesTaxTotals.wine/1,
            SalesTaxAddl: this.footer.salesTaxTotals.addl/1,
            ShippingWine: this.footer.shippingTotals.wine/1,
            ShippingAddl: this.footer.shippingTotals.addl/1
        };
        let master = orderBundle.orderMaster;
        orderBundle.orderMaster.Amount = master.TotalPriceWine + master.TotalPriceAddl + master.SalesTaxWine
            + master.SalesTaxAddl + master.ShippingWine + master.ShippingAddl;
        orderBundle.orderDetails = this.orders.map(
            (a)=>{
                return(
                    {OfferId:a.id
                        ,OrderQty:a.orderQty
                        ,WishList:a.wishList
                        ,Price:a.price
                    })});
        orderBundle.orderImpDetails = {AddressId:this.selectedAddress.id,CreditCardId:this.selectedCard.id};
        this.appService.httpPost('post:save:approve:request',orderBundle);
    };

    computeTotals() {
        this.orders = this.appService.request('orders');
        // this.orders = [{ availableQty: 3, id: 1, item: 'test item1', orderQty: 2, packing: 'p', price: 120, wishList: 2 },
        // { availableQty: 3, id: 1, item: 'test item1', orderQty: 22, packing: 'p', price: 125, wishList: 1 },
        // { availableQty: 3, id: 1, item: 'test item2', orderQty: 11, packing: 'p', price: 130, wishList: 2 },
        // { availableQty: 3, id: 1, item: 'test item3', orderQty: 5, packing: 'p', price: 150, wishList: 3 },
        // { availableQty: 3, id: 1, item: 'test item4', orderQty: 2, packing: 'p', price: 130, wishList: 5 },
        // ];        
        //totals
        if(!this.orders){
            console.log('Order request is not available.');
            return;
        }
        this.footer.wineTotals = this.orders.reduce(function (a, b) {
            return ({
                wine: a.wine + b.price * b.orderQty
                , addl: a.addl + b.price * b.wishList
            })
        }, { wine: 0, addl: 0 });

        //Sales tax
        this.computeSalesTax();
        this.computeShipping();

        //grand totals
        this.footer.grandTotals = {
            wine: this.footer.wineTotals.wine + this.footer.salesTaxTotals.wine + this.footer.shippingTotals.wine
            + this.footer.prevBalances.wine
            , addl: this.footer.wineTotals.addl / 1 + this.footer.salesTaxTotals.addl / 1 + this.footer.shippingTotals.addl / 1
            + this.footer.prevBalances.addl / 1
        };
    };

    computeSalesTax() {
        let effectiveSalesTaxPerc = this.selectedAddress.salesTaxPerc;
        if (effectiveSalesTaxPerc && (effectiveSalesTaxPerc > 0)) {
            this.footer.salesTaxPerc = effectiveSalesTaxPerc;
        } else {
            effectiveSalesTaxPerc = this.selectedAddress.defaultSalesTaxPerc;
            if (effectiveSalesTaxPerc && (effectiveSalesTaxPerc > 0)) {
                this.footer.salesTaxPerc = effectiveSalesTaxPerc;
            } else {
                this.footer.salesTaxPerc = 0.00;
            }
        }
        this.footer.salesTaxTotals = {
            wine: this.footer.wineTotals.wine * this.footer.salesTaxPerc / 100,
            addl: this.footer.wineTotals.addl * this.footer.salesTaxPerc / 100
        }
    };

    computeShipping() {
        let effectiveShipping = this.selectedAddress.shippingCharges;
        if (effectiveShipping && (effectiveShipping > 0)) {
            this.footer.shippingTotals = effectiveShipping;
        } else {
            effectiveShipping = this.selectedAddress.defaultShippingCharges;
            if (effectiveShipping && (effectiveShipping > 0)) {
                this.footer.shippingTotals = { wine: effectiveShipping, addl: effectiveShipping };
            } else {
                this.footer.shippingTotals = { wine: 0.00, addl: 0.00 };
            }
        }
    };
    ngOnInit() {
        this.appService.httpGet('get:approve:artifacts')
    };
    ngOnDestroy() {
        this.approveArtifactsSub.unsubscribe();
        this.allAddrSubscription.unsubscribe();
        this.allCardSubscription.unsubscribe();
    };

    public alerts: Array<Object> = [
        {
            type: 'danger',
            msg: 'Oh snap! Change a few things up and try submitting again.'
        },
        {
            type: 'success',
            msg: 'Well done! You successfully read this important alert message.',
            closable: true
        }
    ];
    public closeAlert(i: number): void {
        this.alerts.splice(i, 1);
    };

    public addAlert(): void {
        this.alerts.push({ msg: 'Another alert!', type: 'warning', closable: true });
    };
}