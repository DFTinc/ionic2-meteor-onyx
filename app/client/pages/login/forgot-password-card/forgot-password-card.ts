/**
 * Created by mjwheatley on 3/16/16.
 */
import {Component, NgZone} from 'angular2/core';
import {IONIC_DIRECTIVES, NavController, Alert} from 'ionic-angular';
import {FormBuilder, Control,  ControlGroup, Validators, AbstractControl} from 'angular2/common';
import {MeteorComponent} from 'angular2-meteor';
import {FormValidator} from "../../../utils/FormValidator";
import {ToastMessenger} from "../../../utils/ToastMessenger";

@Component({
    selector: 'forgot-password-card',
    templateUrl: '/client/pages/login/forgot-password-card/forgot-password-card.html',
    directives: [IONIC_DIRECTIVES]
})
export class ForgotPasswordCardComponent extends MeteorComponent {
    private forgotPwForm:ControlGroup;
    private emailControl:AbstractControl;
    private email:string;

    constructor(private nav:NavController, private fb:FormBuilder, private zone:NgZone) {
        super();
    }

    ngOnInit() {
        this.forgotPwForm = this.fb.group({
            'emailControl': ['', Validators.compose([
                Validators.required,
                FormValidator.validEmail,
                FormValidator.registered
            ])]
        });

        this.emailControl = this.forgotPwForm.controls['emailControl'];

        this.autorun(() => {
            this.email = Session.get("email");
        });
    }

    private emailPasswordResetCode(form:{emailControl:string}):void {
        var component = this;
        if (this.forgotPwForm.valid) {
            Accounts.forgotPassword({email: form.emailControl.toLowerCase()}, function (error) {
                if (error) {
                    console.log("Error sending forgot password email: " + JSON.stringify(error));
                    if (error.reason && error.reason === "User not found") {
                        console.log("User not found");
                        Session.set("registeredError", true);
                        component.emailControl.updateValueAndValidity(true);
                    } else {
                        var toastMessage = error.message;
                        if (error.reason) {
                            toastMessage = error.reason;
                        }
                        new ToastMessenger().toast({
                            type: "error",
                            message: toastMessage,
                            title: "Password Reset Error"
                        });
                    }
                } else {
                    console.log("Sending password reset email...");
                    Session.set("forgotPassword", !Session.get("forgotPassword"));
                    Session.set("resetPassword", !Session.get("resetPassword"));
                }
            });
        }
    }

    private showSignInCard() {
        Session.set("forgotPassword", !Session.get("forgotPassword"));
        Session.set("email", this.email);
    }
}