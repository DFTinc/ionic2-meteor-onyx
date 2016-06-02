import {MeteorComponent} from 'angular2-meteor';
import {App, IonicApp, Platform, NavController, ViewController, Loading} from 'ionic-angular';
import {Component, NgZone, provide, Type} from 'angular2/core';
import {Http, HTTP_PROVIDERS} from 'angular2/http';
import {TranslateService, TranslatePipe, TranslateLoader, TranslateStaticLoader} from 'ng2-translate';
import {MeteorIonicApp} from "./lib/meteor-ionic-app";
import {Constants} from "../lib/Constants";

/*********/
/* Pages */
import {HomePage} from './pages/home/home';
import {LoginPage} from "./pages/login/login";

declare var Meteor;
declare var device;

@MeteorIonicApp({
    templateUrl: '/client/app.html',
    config: { // http://ionicframework.com/docs/v2/api/config/Config/
        //mode: Constants.STYLE.MD,
        //pageTransition: Constants.STYLE.IOS,
        //swipeBackEnabled: false,
        //tabbarPlacement: 'top'
    },
    providers: [
        HTTP_PROVIDERS,
        provide(TranslateLoader, {
            useFactory: (http:Http) => new TranslateStaticLoader(http, '/i18n', '.json'),
            deps: [Http]
        }),
        TranslateService
    ],
    pipes: [TranslatePipe]
})
class MyApp extends MeteorComponent {
    // Set the root (or first) page
    private rootPage:Type = LoginPage;
    private pages:Array<IPage>;
    private appName:string;
    private user:Meteor.User;
    private loading:Loading;
    private isLoading:boolean = false;

    constructor(private app:IonicApp,
                private platform:Platform,
                private zone:NgZone,
                private translate:TranslateService) {
        super();
    }

    ngOnInit():void {
        this.initializeApp();

        // set the nav menu title to the application name from settings.json
        this.appName = Meteor.settings.public.appName;

        Tracker.autorun(() => this.zone.run(() => {
            // Use this to update component variables based on reactive sources.
            // (i.e. Monogo collections or Session variables)
            this.user = Meteor.user();
            console.log("user: ", this.user);
            this.setPages();
        }));

        // Show a loading spinner
        this.autorun(() => {
            if (Session.get(Constants.SESSION.LOADING)) {
                var nav:NavController = this.app.getComponent('nav');
                if (nav) {
                    // Delay to prevent showing if loaded quickly
                    Meteor.setTimeout(() => {
                        if (Session.get(Constants.SESSION.LOADING)) {
                            this.loading = Loading.create({
                                spinner: 'crescent'
                                //content: 'Loggin in...'
                            });
                            nav.rootNav.present(this.loading);
                            this.isLoading = true;
                        }
                    }, 500);
                }
            } else {
                if (this.isLoading) {
                    this.loading.dismiss();
                }
            }
        });

        // Monitor server connection status
        this.autorun(() => {
            console.log("Meteor.status: " + Meteor.status().status);
        });
    }

    private setPages():void {
        // set our app's pages
        // title references a key in the language JSON to be translated by the translate pipe in the HTML
        this.pages = [{
            icon: "ios-log-in-outline",
            title: "login.titles.signIn",
            component: LoginPage,
            rootPage: true,
            show: !this.user
        }, {
            icon: "ios-home-outline",
            title: "home.title",
            component: HomePage,
            rootPage: true,
            show: this.user
        }];
    }

    private initializeApp() {
        this.platform.ready().then(() => {
            // The platform is now ready. Note: if this callback fails to fire, follow
            // the Troubleshooting guide for a number of possible solutions:
            //
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            //
            // First, let's hide the keyboard accessory bar (only works natively) since
            // that's a better default:
            //
            // Keyboard.setAccessoryBarVisible(false);
            //
            // For example, we might change the StatusBar color. This one below is
            // good for dark backgrounds and light text:
            // StatusBar.setStyle(StatusBar.LIGHT_CONTENT)

            this.initializeTranslateServiceConfig();
            this.setStyle();
        });
    }

    private initializeTranslateServiceConfig() {
        var prefix = '/i18n/';
        var suffix = '.json';

        var userLang = navigator.language.split('-')[0];
        userLang = /(en|es)/gi.test(userLang) ? userLang : 'en';

        this.translate.setDefaultLang('en');
        let langPref = Session.get(Constants.SESSION.LANGUAGE);
        if (langPref) {
            userLang = langPref;
        }
        Session.set(Constants.SESSION.LANGUAGE, userLang);
        this.translate.use(userLang);
    }

    private openPage(page):void {
        this.navigate({page: page.component, setRoot: page.rootPage});
    }

    private goSignIn():void {
        this.navigate({page: LoginPage, setRoot: true, title: "Login"});
    }

    private logout():void {
        this.user = null;
        Meteor.logout();
        this.navigate({page: LoginPage, setRoot: true, title: "Login"});
    }

    private navigate(location:{page:any, setRoot:boolean, title?:string}):void {
        // close the menu when clicking a link from the menu
        // getComponent selector is the component id attribute
        this.app.getComponent('leftMenu').close().then(() => {
            var nav:NavController = this.app.getComponent('nav');
            if (location.setRoot) {
                console.log("Set Root Page: " + location.title);
                nav.setRoot(location.page);
            } else {
                if (location.page) {
                    let viewCtrl = nav.getActive();
                    if (viewCtrl.componentType !== location.page) {
                        nav.push(location.page);
                    }
                }
            }
        });
    }

    private setStyle():void {
        // Change value of the meta tag
        var links:any = document.getElementsByTagName("link");
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            if (link.getAttribute("rel").indexOf("style") != -1 && link.getAttribute("title")) {
                link.disabled = true;
                if (link.getAttribute("title") === this.getBodyStyle())
                    link.disabled = false;
            }
        }
    }

    private getBodyStyle():string {
        var bodyTag:any = document.getElementsByTagName("body")[0];
        var bodyClass = bodyTag.className;
        var classArray = bodyClass.split(" ");
        var bodyStyle = classArray[0];
        return bodyStyle;
    }
}

interface IPage {
    icon?:string,
    title: string,
    component: Type,
    rootPage: boolean,
    show?: any
}