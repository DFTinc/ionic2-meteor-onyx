import {Page, NavController} from 'ionic-angular';
import {NgZone} from 'angular2/core';
import {TranslateService, TranslatePipe} from 'ng2-translate';

//App components
import {LoginCardComponent} from './login-card/login-card';
import {ForgotPasswordCardComponent} from './forgot-password-card/forgot-password-card';
import {PasswordResetCardComponent} from './password-reset-card/password-reset-card';
import {CreateAccountCardComponent} from './create-account-card/create-account-card';
//import {BootstrapLoginCardComponent} from './login-card-bootstrap/login-card-bootstrap';

@Page({
    templateUrl: '/client/pages/login/login.html',
    directives: [
        LoginCardComponent,
        ForgotPasswordCardComponent,
        PasswordResetCardComponent,
        CreateAccountCardComponent
    ],
    pipes: [TranslatePipe]
})
export class LoginPage {
    private pageTitle:string;
    private forgotPassword:boolean = false;
    private createAccount:boolean = false;
    private resetPassword:boolean = false;

    constructor(private nav:NavController, private zone:NgZone, private translate:TranslateService) {
    }

    ngOnInit() {
        this.pageTitle = "login.titles.signIn";
        Tracker.autorun(() => this.zone.run(() => {
            this.forgotPassword = Session.get("forgotPassword");
            this.createAccount = Session.get("createAccount");
            this.resetPassword = Session.get("resetPassword");
            if (this.createAccount) {
                this.pageTitle = "login.titles.createAccount";
            } else if (this.forgotPassword) {
                this.pageTitle = "login.titles.forgotPassword";
            } else if (this.resetPassword) {
                this.pageTitle = "login.titles.resetPassword";
            } else {
                this.pageTitle = "login.titles.signIn";
            }
        }));
    }

    /*Life Cycle*/
    onPageWillEnter() {
        Session.set("incorrectPassword", false);
        Session.set("forgotPassword", false);
        Session.set("createAccount", false);
        Session.set("resetPassword", false);
    }
}
