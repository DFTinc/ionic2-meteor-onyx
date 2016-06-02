/**
 * Created by mjwheatley on 5/31/16.
 */
import {NavController, Alert} from "ionic-angular";
import {TranslateService} from 'ng2-translate';

declare var Meteor;
declare var navigator;
declare var Onyx;

export class OnyxHelper {
    constructor(private nav:NavController, private translate:TranslateService) {
    }

    public execOnyx(options) {
        if (Meteor.isCordova) {
            options.onyxLicense = Meteor.settings.public.onyxLicense;
            navigator.onyx.exec(
                options,
                this.successCallback.bind(this),
                this.errorCallback.bind(this)
            );
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

    private successCallback(result):void {
        var self = this;
        console.log("successCallback(): " + JSON.stringify(result));
        console.log("action: " + result.action);
        switch (result.action) {
            case Onyx.Action.IMAGE:
                if (result.hasOwnProperty("imageUri")) {
                    Session.set("imageUri", result.imageUri);
                }
                break;
            case Onyx.Action.VERIFY:
                if (result.hasOwnProperty("nfiqScore")) {
                    console.log("isVerified", result.isVerified);
                    console.log("nfiqScore: " + result.nfiqScore);
                    var title = (result.isVerified ? "Verified" : "Failed");
                    let alert = Alert.create({
                        title: title,
                        message: "Match score: " + result.nfiqScore,
                        buttons: ["OK"]
                    });
                    self.nav.present(alert);
                }
                break;
            case Onyx.Action.ENROLL:
                if (result.hasOwnProperty("template")) {
                    Meteor.call('onyx/fingerprint/save', {template: result.template}, function (error, result) {
                        if (error) {
                            console.log("Error saving fingerprint template: ", error);
                        } else {
                            console.log("Successfully saved fingerprint template.");
                            let alert = Alert.create({
                                title: "Fingerprint Template Saved",
                                buttons: ["OK"]
                            });
                            self.nav.present(alert);
                        }
                    });
                }
                break;
            case Onyx.Action.TEMPLATE:
                if (result.hasOwnProperty("template")) {
                    Meteor.call('onyx/fingerprint/verify', {
                        template: result.template,
                        signInWithOnyx: Session.get("signInWithOnyx")
                    }, function (error, result) {
                        var alertConfig:any = {};
                        if (error) {
                            console.log("Error verifying fingerprint template: ", error);
                            var msg;
                            if (error.reason) {
                                msg = error.reason;
                            } else if (error.message) {
                                msg = error.message;
                            } else {
                                msg = error;
                            }
                            alertConfig.title = "Verify Error";
                            alertConfig.message = msg;
                        } else {
                            if (result.isVerified) {
                                alertConfig.title = "Verified";
                                alertConfig.message = "Your fingerprint matched!";
                                if (result.token) {
                                    Meteor.loginWithToken(result.token);
                                }
                            } else {
                                alertConfig.title = "Failed";
                                alertConfig.message = "Your fingerprint did not match!"
                            }
                            alertConfig.message += "\nMatch Score: " + result.score;
                        }
                        alertConfig.buttons = ["OK"];
                        let alert = Alert.create(alertConfig);
                        self.nav.present(alert);
                    });
                }
                break;
        }
    }

    private errorCallback(message):void {
        console.log("errorCallback(): " + message);
        let alert = Alert.create({
            title: "Onyx Error",
            message: message
        });
        this.nav.present(alert);
    }
}