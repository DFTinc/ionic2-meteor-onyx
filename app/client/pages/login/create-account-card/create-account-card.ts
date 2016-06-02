/**
 * Created by mjwheatley on 3/16/16.
 */
import {Component} from 'angular2/core';
import {IONIC_DIRECTIVES, NavController, Alert} from 'ionic-angular';
import {FormBuilder, Control,  ControlGroup, Validators, AbstractControl, NgClass} from 'angular2/common';
import {MeteorComponent} from 'angular2-meteor';
import {FormValidator} from "../../../utils/FormValidator";
import {ToastMessenger} from "../../../utils/ToastMessenger";
import {HomePage} from "../../home/home";

@Component({
    selector: 'create-account-card',
    templateUrl: '/client/pages/login/create-account-card/create-account-card.html',
    directives: [IONIC_DIRECTIVES]
})
export class CreateAccountCardComponent extends MeteorComponent {
    private createAccountForm:ControlGroup;
    private givenNameControl:AbstractControl;
    private familyNameControl:AbstractControl;
    private emailControl:AbstractControl;
    private confirmEmailControl:AbstractControl;
    private passwordControl:AbstractControl;
    private confirmPasswordControl:AbstractControl;

    private user:{
        email:string,
        password:string,
        profile:{
            name:{
                given:string,
                family:string,
                display:string
            }
        }
    };

    constructor(private nav:NavController, private fb:FormBuilder) {
        super();
    }

    ngOnInit() {
        /* Setup form controls */
        this.createAccountForm = this.fb.group({
            'givenNameControl': ['', Validators.compose([
                Validators.required,
            ])],
            'familyNameControl': ['', Validators.compose([
                Validators.required,
            ])],
            'emailControl': ['', Validators.compose([
                Validators.required,
                FormValidator.validEmail,
                FormValidator.notRegistered
            ])],
            'confirmEmailControl': ['', Validators.compose([
                Validators.required,
                FormValidator.validEmail
            ])],
            'passwordControl': ['', Validators.compose([
                Validators.required
            ])],
            'confirmPasswordControl': ['', Validators.compose([
                Validators.required
            ])]
        }, {
            validator: Validators.compose([
                FormValidator.matchingFields('mismatchedPasswords', 'passwordControl', 'confirmPasswordControl'),
                FormValidator.matchingFields('mismatchedEmails', 'emailControl', 'confirmEmailControl')
            ])
        });

        this.givenNameControl = this.createAccountForm.controls['givenNameControl'];
        this.familyNameControl = this.createAccountForm.controls['familyNameControl'];
        this.emailControl = this.createAccountForm.controls['emailControl'];
        this.confirmEmailControl = this.createAccountForm.controls['confirmEmailControl'];
        this.passwordControl = this.createAccountForm.controls['passwordControl'];
        this.confirmPasswordControl = this.createAccountForm.controls['confirmPasswordControl'];
        /* End for control */

        this.user = {
            email: "",
            password: "",
            profile: {
                name: {
                    given: "",
                    family: "",
                    display: ""
                }
            }
        };

        this.autorun(() => {
            this.user.email = Session.get("email");
            Session.get("notRegisteredError");
        });
    }

    private createAccount():void {
        if (this.createAccountForm.valid) {
            var component = this;
            Accounts.createUser({
                email: component.user.email,
                password: component.user.password,
                profile: {
                    name: {
                        display: component.user.profile.name.given + " " + component.user.profile.name.family,
                        given: component.user.profile.name.given,
                        family: component.user.profile.name.family
                    }
                }
            }, function (error) {
                if (error) {
                    console.log("Error creating user: " + JSON.stringify(error));
                    var toastMessage = "";
                    if (error.reason) {
                        if (error.reason === "Email already exists.") {
                            Session.set("notRegisteredError", true);
                            component.emailControl.updateValueAndValidity(true);
                            error.reason = "Email already registered!";
                        }
                        toastMessage = error.reason;
                    } else {
                        toastMessage = error.message;
                    }
                    new ToastMessenger().toast({type: "error", message: toastMessage, title: "Create Account Error"});
                } else {
                    console.log("Successfully created a new user account.");
                    // TODO show a welcome alert dialog
                    component.nav.setRoot(HomePage);
                }
            });
        }
    }

    private showSignInCard() {
        Session.set("createAccount", !Session.get("createAccount"));
        Session.set("email", this.user.email);
    }
}