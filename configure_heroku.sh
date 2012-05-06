#!/bin/sh
# Set REDISTOGO_URL env from another heroku app using Redis To Go.
# @author: Sébastien Saunier

if [ $# -eq 0 ]; then
  echo "Usage: ./configure_heroku.sh OTHER_HEROKU_APP"
  exit 1
fi

NODE_REDIS_MONITOR_PATH=`pwd`

cd OTHER_HEROKU_APP
REDISTOGO_URL=`heroku config -s | grep REDISTOGO_URL`
NODE_REDIS_MONITOR_PATH
heroku config:add $REDISTOGO_URL

echo "Successfully set REDISTOGO_URL=\033[0;32m$REDISTOGO_URL\033[0;0m from $OTHER_HEROKU_APP"
