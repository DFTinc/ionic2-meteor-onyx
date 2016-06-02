import {Page, NavController, Alert} from 'ionic-angular';
import {NgZone} from 'angular2/core';
import {TranslateService, TranslatePipe} from 'ng2-translate';
import {MeteorComponent} from 'angular2-meteor';
import {OnyxHelper} from "../../utils/OnyxHelper";

declare var navigator;
declare var Onyx;
declare var Meteor;

@Page({
    templateUrl: '/client/pages/home/home.html',
    pipes: [TranslatePipe]
})
export class HomePage extends MeteorComponent {
    private imageUri:String;
    private user:Meteor.User;
    private onyxHelper:OnyxHelper;

    constructor(private nav:NavController,
                private zone:NgZone,
                private translate:TranslateService) {
        super();
    }

    ngOnInit():void {
        this.onyxHelper = new OnyxHelper(this.nav, this.translate);
        Tracker.autorun(() => this.zone.run(() => {
            this.user = Meteor.user();
            this.imageUri = Session.get("imageUri");
        }));
    }

    onPageWillEnter():void {
        Session.set("imageUri", null);
        Session.set("signInWithOnyx", null);
    }

    private onyxCapture():void {
        if (Meteor.isCordova) {
            this.onyxHelper.execOnyx({action: Onyx.Action.IMAGE});
        }
    }

    private onyxEnroll():void {
        if (Meteor.isCordova) {
            this.onyxHelper.execOnyx({action: Onyx.Action.ENROLL});
        }
    }

    private onyxVerify():void {
        if (Meteor.isCordova) {
            this.onyxHelper.execOnyx({action: Onyx.Action.VERIFY});
        }
    }

    private onyxGetTemplate():void {
        if (Meteor.isCordova) {
            Session.set("signInWithOnyx", null);
            this.onyxHelper.execOnyx({action: Onyx.Action.TEMPLATE});
        }
    }
}
