import { Component } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router, NavigationEnd, Event } from '@angular/router';
import { Subscription } from 'rxjs/subscription';
import { AppService } from '../services/app.service';
import { viewBoxConfig } from '../config';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core'
//import {DialogModule} from 'primeng/primeng';

@Component({
  selector: 'my-app',
  templateUrl: 'app/components/app.component.html'
})

export class AppComponent {
  subscription: Subscription;
  initDataSub: Subscription;
  needHelpSub:Subscription;
  home: string = '#';
  kistler: string = '#';
  viewBox: {} = viewBoxConfig['/login'];

 showMenu: boolean = false;
  myAccountshowMenu: boolean = false;
  currentUser: string = "";
  needHelpText: string = "";
  //needHelpDisplay:boolean=false;

  constructor(private appService: AppService, private router: Router, private idle: Idle) {
    this.initMenu(window.innerWidth);
    this.needHelpSub = appService.behFilterOn('masters:download:success').subscribe(d => {
      this.needHelpText = this.appService.getNeedHelpText();
      //this.isDataReady = true;
    });
    this.initDataSub = appService.filterOn('get:init:data').subscribe(d => {
      
      if (d.data.error) {
        console.log(d.data.error);
      } else {
        //this.home = d.data.host;
        this.kistler = d.data.kistler;
      }
    });    
    router.events.filter((e: Event, t: number) => {
      return (e.constructor.name === 'NavigationEnd');
    }).subscribe((event: any) => {
      let url = event.urlAfterRedirects.split('?')[0];
      this.viewBox = viewBoxConfig[url];
    });
  };

  logout = () => {
    this.appService.resetCredential();
    if (this.idle.isIdling() || this.idle.isRunning()) {
      this.idle.stop();
    }
  };
  ngOnInit() {
    this.appService.httpGet('get:init:data');
    //request / reply mecanism to start inactivity timer at successful login
    this.appService.reply('login:success', this.setInactivityTimeout);
    //this.setInactivityTimeout();
  };

  //Total timeout period is secs * 2
  setInactivityTimeout = (secs) => {
    //set current user to be displayed to nav bar
    let credential = this.appService.getCredential();
    if (credential) {
      this.currentUser = credential.email;
    }
    if (this.idle.isIdling() || this.idle.isRunning()) {
      this.idle.stop();
    }
    // sets an idle timeout of 15 seconds, for testing purposes.
    this.idle.setIdle(Number(secs));
    // sets a timeout period of 15 seconds. after 30 seconds of inactivity, the user will be considered timed out.
    this.idle.setTimeout(Number(secs));
    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    // this.idle.onIdleEnd.subscribe(() => { 
    //   // this.idleState = 'No longer idle.' ;
    //   console.log('Idle end');
    // });
    this.idle.onTimeout.take(1).subscribe(() => {
      // this.idleState = 'Timed out!';
      // this.timedOut = true;
      console.log('time out');
      this.logout();
      this.router.navigate(['/login']);
    });
    // this.idle.onIdleStart.subscribe(() => { 
    //   // this.idleState = 'You\'ve gone idle!' ;
    //   console.log('idle start');
    // });
    // this.idle.onTimeoutWarning.subscribe((countdown) => { 
    //   // this.idleState = 'You will time out in ' + countdown + ' seconds!' ;
    // });

    this.idle.watch();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.initDataSub.unsubscribe();
    this.needHelpSub.unsubscribe();
  };
  menuToggle(){
  this.showMenu = !this.showMenu;
  };
  myAccountToggle(){
  this.myAccountshowMenu = !this.myAccountshowMenu;
  };
  initMenu(windowSize) {
    if (windowSize > 768) {
      this.showMenu = true;
      this.myAccountshowMenu = true;
    } else {
      this.showMenu = false;
      this.myAccountshowMenu = false;
    }
  }
 onResize(event) {
  this.initMenu(event.target.innerWidth);
};

}
