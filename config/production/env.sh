#!/usr/bin/env bash
# This .sh file will be sourced before starting your application.
# You can use it to put environment variables you want accessible
# to the server side of your app by using process.env.MY_VAR
#
# Example:
# export MONGO_URL="mongodb://localhost:27017/myapp-development"
# export ROOT_URL="http://localhost:3000"

export METEOR_SETTINGS=$(cat settings.json)
export PORT="3000"
export ROOT_URL="http://ionic2-meteor-onyx.duckdns.org:3000"
export MONGO_URL="mongodb://localhost:27017/ionic2-meteor-onyx-dev"
export DDP_DEFAULT_CONNECTION_URL=$ROOT_URL