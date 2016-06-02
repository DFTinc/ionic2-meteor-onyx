/**
 * Created by mjwheatley on 3/16/16.
 */
import {Component, NgZone} from 'angular2/core';
import {IONIC_DIRECTIVES, NavController, Alert} from 'ionic-angular';
import {FormBuilder, Control,  ControlGroup, Validators, AbstractControl, NgClass} from 'angular2/common';
import {MeteorComponent} from 'angular2-meteor';
import {FormValidator} from "../../../utils/FormValidator";
import {HomePage} from "../../home/home";


@Component({
    selector: 'password-reset-card',
    templateUrl: '/client/pages/login/password-reset-card/password-reset-card.html',
    directives: [IONIC_DIRECTIVES]
})

export class PasswordResetCardComponent extends MeteorComponent {
    private user:Meteor.User;
    private passwordResetForm:ControlGroup;
    private passwordResetCode:AbstractControl;
    private password:AbstractControl;
    private confirmPassword:AbstractControl;
    private resetPasswordError:boolean = false;
    private resetPasswordErrorMessage:string;

    constructor(private nav:NavController, private fb:FormBuilder, private zone:NgZone) {
        super();
    }

    ngOnInit() {
        this.passwordResetForm = this.fb.group({
            'passwordResetCode': ['', Validators.compose([
                Validators.required,
                FormValidator.validPasswordResetToken
            ])],
            'password': ['', Validators.compose([
                Validators.required
            ])],
            'confirmPassword': ['', Validators.compose([
                Validators.required
            ])]
        }, {validator: FormValidator.matchingFields('mismatchedPasswords', 'password', 'confirmPassword')});

        this.passwordResetCode = this.passwordResetForm.controls['passwordResetCode'];
        this.password = this.passwordResetForm.controls['password'];
        this.confirmPassword = this.passwordResetForm.controls['confirmPassword'];

        Tracker.autorun(() => this.zone.run(() => {
            this.user = Meteor.user();
            this.resetPasswordError = Session.get("resetPasswordError");
            this.resetPasswordErrorMessage = Session.get("resetPasswordErrorMessage");
        }));
    }

    private resetPassword(form:{passwordResetCode:string, password:string, confirmPassword:string}):void {
        var component = this;
        if (this.passwordResetForm.valid) {
            Accounts.resetPassword(form.passwordResetCode, form.password, function (error) {
                if (error) {
                    console.log("Reset Password Error: " + JSON.stringify(error));
                    if (error.reason === "Token expired") {
                        Session.set("resetPasswordError", true);
                        Session.set("resetPasswordErrorMessage", "Password reset code invalid or expired.");
                        component.passwordResetCode.updateValueAndValidity(true);
                    }
                } else {
                    console.log("Successfully changed password");
                    Session.set("resetPasswordToken", null);
                    Session.set("wasPasswordReset", true);
                    component.nav.setRoot(HomePage);
                }
            });
        }
    }

    private showSignInCard() {
        Session.set("resetPassword", !Session.get("resetPassword"));
    }
}