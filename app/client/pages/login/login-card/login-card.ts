/**
 * Created by mjwheatley on 3/7/16.
 */
import {Component, NgZone} from 'angular2/core';
import {IONIC_DIRECTIVES, NavController, Alert} from 'ionic-angular';
import {FormBuilder, Control,  ControlGroup, Validators, AbstractControl} from 'angular2/common';
import {MeteorComponent} from 'angular2-meteor';
import {FormValidator} from "../../../utils/FormValidator";
import {ToastMessenger} from "../../../utils/ToastMessenger";
import {HomePage} from "../../home/home";
import {OnyxHelper} from "../../../utils/OnyxHelper";
import {TranslateService, TranslatePipe} from "ng2-translate";

declare var Onyx;

@Component({
    selector: 'login-card',
    templateUrl: '/client/pages/login/login-card/login-card.html',
    directives: [IONIC_DIRECTIVES],
    pipes: [TranslatePipe]
})
export class LoginCardComponent extends MeteorComponent {
    private loginForm:ControlGroup;
    private emailControl:AbstractControl;
    private passwordControl:AbstractControl;
    private email:string;

    constructor(private nav:NavController,
                private fb:FormBuilder,
                private zone:NgZone,
                private translate:TranslateService) {
        super();
    }

    ngOnInit() {

        this.loginForm = this.fb.group({
            'emailControl': ['', Validators.compose([
                Validators.required,
                FormValidator.validEmail,
                FormValidator.registered
            ])],
            "passwordControl": ['', Validators.compose([
                Validators.required,
                FormValidator.validPassword
            ])]
        });

        this.emailControl = this.loginForm.controls['emailControl'];
        this.passwordControl = this.loginForm.controls['passwordControl'];

        this.autorun(() => {
            if (Meteor.user()) {
                this.nav.setRoot(HomePage);
            }
        });

        Tracker.autorun(() => this.zone.run(() => {
            Session.get("registeredError");
            Session.get("incorrectPassword");
            this.email = Session.get("email");
        }));
    }

    private onSubmit(form:{emailControl:string, passwordControl:string}):void {
        var self = this;
        if (this.loginForm.valid) {
            Session.set("email", form.emailControl);
            Meteor.loginWithPassword(
                {email: form.emailControl.toLowerCase()},
                form.passwordControl,
                function (error) {
                    if (error) {
                        console.log("loginWithPassword Error: " + JSON.stringify(error));
                        var toastMessage = null;
                        if (error.reason) {

                            if (error.reason === "Incorrect password") {
                                console.log("Incorrect password");
                                Session.set("incorrectPassword", true);
                                self.passwordControl.updateValueAndValidity(true);
                            } else if (error.reason === "User not found") {
                                console.log("User not found");
                                Session.set("registeredError", true);
                                self.emailControl.updateValueAndValidity(true);
                            } else if (error.reason === "User has no password set") {
                                toastMessage = "This account uses social sign in.";
                            } else {
                                toastMessage = error.reason;
                            }
                        } else {
                            toastMessage = error.message;
                        }
                        if (toastMessage) {
                            new ToastMessenger().toast({
                                type: "error",
                                message: toastMessage,
                                title: "Sign In Error"
                            });
                        }
                    } else {
                        console.log("Successfully logged in with password.");
                        //self.nav.rootNav.setRoot(HomePage);
                    }
                }
            );
        }
    }

    private signInWithOnyx(form:{emailControl:string, passwordControl:string}):void {
        if (Meteor.isCordova) {
            var self = this;
            console.log("form: ", form);
            Session.set("email", form.emailControl);
            Meteor.call('isEmailRegistered', form.emailControl.toLowerCase(), function (error, result) {
                if (error) {
                    new ToastMessenger().toast({
                        type: "error",
                        title: "Sign In Error",
                        message: error.message
                    });
                } else if (!result) {
                    console.log("User not found");
                    Session.set("registeredError", true);
                    self.emailControl.updateValueAndValidity(true);
                } else {
                    new OnyxHelper(self.nav, self.translate).execOnyx({action: Onyx.Action.TEMPLATE});
                    Session.set("signInWithOnyx", form.emailControl.toLowerCase());
                }
            });
        } else {
            console.log("This feature is only available on cordova devices.");
            let alert = Alert.create({
                title: "Cordova Only!",
                message: "This feature is only available on cordova devices.",
                buttons: ["OK"]
            });
            this.nav.present(alert);
        }
    }

    private showForgotPasswordCard():void {
        Session.set("forgotPassword", true);
        Session.set("email", this.email);
    }

    private showCreateAccountCard():void {
        Session.set("createAccount", true);
        Session.set("email", this.email);
    }
}