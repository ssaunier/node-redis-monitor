# What's this?

```node-redis-monitor``` is a small web application to monitor your redis server.
It plots the number of commands per seconds and the memory usage.

# Setup on Heroku

We'll create another application ```NAME_OF_YOUR_MONITORING_APP```to monitor
another app ```OTHER_APP_USING_REDIS```which uses Redis To Go.

    heroku apps:create --stack cedar NAME_OF_YOUR_MONITORING_APP

Then we configure the monitoring app with the redis url of the one to monitor.

    ./configure_heroku.sh PATH_TO_OTHER_APP_USING_REDIS

Some more configuration...

    heroku config:add NODE_ENV=production

Now we can deploy to Heroku

    git push heroku master

And see pretty graphs!

    heroku open
