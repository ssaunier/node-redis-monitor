```node-redis-monitor``` is a small web application to monitor your redis server.
It plots the number of commands per seconds and the memory usage.

# Setup on Heroku

    heroku apps:create --stack cedar NAME_OF_YOUR_MONITORING_APP

    ./configure_heroku.sh PATH_TO_OTHER_APP_USING_REDIS


    heroku config:add NODE_ENV=production

    git push heroku master

    heroku open
