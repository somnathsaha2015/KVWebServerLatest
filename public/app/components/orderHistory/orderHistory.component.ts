import { Component } from '@angular/core';
import { Subscription } from 'rxjs/subscription';
import { AppService } from '../../services/app.service';

@Component({
    templateUrl: 'app/components/orderHistory/orderHistory.component.html'
})
export class OrderHistory {

    orderHeaderSub: Subscription;
    orderDetailsSub: Subscription;
    orderHeaders: [{}];
    orderDetails: any = {};
    selectedOrder: {};
    constructor(private appService: AppService) {
        this.orderDetailsSub = appService.filterOn('get:order:details')
            .subscribe(d => {
                if (d.data.error) {
                    console.log(d.data.error);
                } else {
                    this.orderDetails.details = JSON.parse(d.data).Table[0];
                    this.orderDetails.imp = JSON.parse(d.data).Table1[0];
                }
            });
        this.orderHeaderSub = appService.filterOn('get:order:headers')
            .subscribe(d => {
                if (d.data.error) {
                    console.log(d.data.error);
                } else {
                    this.orderHeaders = JSON.parse(d.data).Table;
                }
            });
    };
    showDetails(order) {
        this.selectedOrder = order;
        this.appService.httpGet('get:order:details', { id: order.id })
        //console.log(id);
    };
    ngOnInit() {
        //let token = this.appService.getToken();
        this.appService.httpGet('get:order:headers')
    };
    ngOnDestroy() {
        this.orderHeaderSub.unsubscribe();
        this.orderDetailsSub.unsubscribe();
    };
}