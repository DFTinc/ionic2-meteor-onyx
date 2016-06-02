# Project Requirements

### Mac OS X
A Mac is required to build the mobile application bundles to utilize the Onyx SDKs provided by cordova-plugin-onyx as Xcode is required to build the iOS bundle and Meteor on Windows does not support mobile builds. 

- Node.js
- Meteor 
- Xcode
- Android Studio
- JDK 7

###Ubuntu Server 14.04 LTS
An Ubuntu Server is required to use the Onyx node module.

- Node.js
- MongoDB
- Onyx
- NGINX
- forever npm

# Setup

## Mac OS X Setup

Download and install [Node.js](https://nodejs.org/en/download/)

Install Meteor
```
curl https://install.meteor.com/ | sh
```

Download and install [Xcode](https://itunes.apple.com/us/app/xcode/id497799835?mt=12)
Download and install [Android Studio](https://developer.android.com/studio/index.html)
Download and install [JDK7](http://www.oracle.com/technetwork/java/javase/downloads/jdk7-downloads-1880260.html)

## Ubuntu Server Setup
###Install Node.js
```
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install -y nodejs
```

###Install MongoDB

https://docs.mongodb.com/v3.0/tutorial/install-mongodb-on-ubuntu/

```
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo service mongod start
```

### Install ONYX
Transfer the onyx-node-bundle to your server
####onyx-node-bundle README
Install IDKit
```
dpkg -i idkit_2.72ubuntu1_amd64.deb
```

Install ONYX dependencies
```
./install-deps.sh
```

Run the following to get the IDKit HWID:
```
/usr/local/share/IDKit_PC_SDK/bin/gethwid
```

Send DFT the output of this, and they will send you a license to install.

Install the license with the following command:
```
sudo /usr/local/share/IDKit_PC_SDK/bin/linux_license_manager -d ~/path/to/your/iengine-license.lic 2
```

Now check the license is correctly installed with
```
sudo /usr/local/share/IDKit_PC_SDK/bin/linux_license_manager -l
```

###Install Forever - NPM
```
sudo npm install forever -g
```

###Install NGINX
```
sudo apt-get update
sudo apt-get install nginx
sudo service nginx start
```


# Development
##Mac OS X

```
git clone https://github.com/DFTinc/ionic2-meteor-onyx.git

cd ionic2-meteor-onyx/app/

mkdir public/stylesheets

npm install

npm start
```

`npm install` will load all the dependencies for angular2-meteor, ionic2, and dev dependencies for building the application.


`npm start` will run the scripts in the package.json to build and start the application.

The scripts in package.json help build the application by using "node-sass" to include the ionic-angular and ionicons node modules when compiling the scss files, "copyfiles" to copy the needed fonts to the applications public directory, and "nodemon" to watch for changes in scss files and rebuild on the fly.  Finally they will execute meteor run, passing in a settings.json, to build and start the meteor application.


###Ionic stylesheets
The build script will output platform specific css bundles into the public/stylesheets/ directory that we created.
The client/index.html includes links to these stylesheets.
The method setStyle() in client/app.ts file will set only one of the stylesheets to be active based on the platform style class that Ionic adds to the body tag.

# Build
##Mac OS X

###Setup NGINX reverse proxy server
####Edit the /config/nginx/appname.conf
Rename the appname.conf file to the name of your application.
Replace all "appname" with the name of your application.

```
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=appname_cache:8m max_size=3000m inactive=600m;
upstream appname_backend {
...

location / {
		proxy_pass         http://appname_backend/;
		...
		# Handle caching
        proxy_cache appname_cache;
```

Set the upstream port the application will be running (3000)

```
upstream appname_backend {
	server 127.0.0.1:3000;
	keepalive 64;
}
```

Replace dns.com with your DNS.

```
server {
	listen 80;	
	server_name www.dns.com dns.com;
	return 301 https://www.dns.com$request_uri;
}

server {
	listen 443 ssl;
	server_name www.dns.com dns.com;
	...
```

Edit the path of SSL cert and key to where they are located on your server

```
ssl_certificate         /etc/nginx/SSL/certs/dns.com.crt;
ssl_certificate_key     /etc/nginx/SSL/private/dns.com.key;
```

###Meteor Build Command

```
cd ionic2-meteor-onyx/app/
```

Replace www.dns.com with your DNS.

```
meteor build --directory ../build/ --mobile-settings ../config/development/settings.json --server https://www.dns.com --architecture os.linux.x86_64
```

`--mobile-settings` preloads the mobile applications with settings.
`--server` sets the url of the server.
`--architecture` indicates to which OS the server bundle will be deployed.
`--directory` indicates the output path for the build.

Edit the /config/development/env.sh
Change the ROOT_URL to your DNS
Indicate the reverse proxy port from the NGINX appName.conf file

```
export METEOR_SETTINGS=$(cat settings.json)
export PORT="3000"
export ROOT_URL="https://www.dns.com"
export MONGO_URL="mongodb://localhost:27017/ionic2-meteor-onyx-dev"
export DDP_DEFAULT_CONNECTION_URL=$ROOT_URL
```

Next copy the appropriate config environment and nginx config into the server bundle and compress the bundle to be transferred to your DNS.

```
cp ../config/development/* ../build/bundle/
cp ../config/nginx/appname.conf ../build/bundle/
cd ../build/
tar -zcvf server-bundle.tar.gz bundle/
```

#Deployment
##Ubuntu Server 14.04 LTS
Transfer the server-bundle.tar.gz to your DNS (/home/ubuntu/appName/)

```
cd /home/ubuntu/appName/
tar -zxvf server-bundle.tar.gz
cd bundle/
```

###NGINX Reverse Proxy Configuration

Copy the NGINX .conf file to the NGINX directory

```
sudo mv appname.conf /etc/nginx/sites-enabled
```

Copy the following from the appname.conf file into the /etc/nginx/nginx.conf inside the http{} block

```
####
# Add to /etc/nginx/nginx.conf
##
# http {
#       map $http_upgrade $connection_upgrade {
#           default upgrade;
#           ''      close;
#       }
#
#       proxy_temp_path /tmp;
#       ssl_session_cache   shared:SSL:10m;
#       ssl_session_timeout 10m;
#   }
####
```

Load the new settings

```
sudo service nginx reload
```

###Install the application, set environment variables, and start the application

```
cd /home/ubuntu/appName/bundle/programs/server/
npm install
cd ../../
source env.sh
forever -l appName.log -o appNameOut.log -e appNameErrors.log start main.js
```

If NGINX is configured properly and the application is installed and running you should now be able to open a browser and navigate to https://www.yourdns.com to access the application running on port 3000.

# Mobile Applications

## Android

- Open Android Studio and make sure it is setup and ready to go.
- Select ***Import project (Eclipse ADT, Gradle, etc.)***
- Navigate to and select /ionic2-meteor-onyx/build/android/project
- Connect an Android device via USB cable.
- Run the application.

*Note: 
Currently have to manually enable permissions requested by cordova-plugin-onyx.
Go to device settings -> Applications -> Application manager -> Ionic2-Meteor-Onyx -> Permissions
**Toggle Camera and Storage ON.**


## iOS 

- Open Finder and navigate to /ionic2-meteor-onyx/build/project/
- Double click Ionic2-Meteor-Onyx.xcodeproj to open the application in Xcode.
Click past any warnings or errors.
If asked to ***Convert to Latest Swift Syntax?*** select Cancel
- Connect an iOS device via USB cable.
- Select the connected device as the target
- Run the application

###Test the application
The application was configured with the settings file and the Url to your DNS.  You should now be able to create an account and enroll a fingerprint template to be save on the server.  Logout and then enter your email address and tap the fingerprint button to log in using Onyx.
 