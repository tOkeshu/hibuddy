# HiBuddy, say hi to your friends !

HiBuddy provides you a simple way to make bidirectional
videoconferences with your friends.

## Goals

  - Provides a small web application.
  - Easy to install, easy to launch, easy to use.
  - Doesn't keep any user data.
  - Free as in freedom.

## Getting Started

### Requirements

  - Firefox with WebRTC enabled
  - `node 0.8.x`
  - `npm 1.1.x`

To use your webcam you will need
[Firefox nightly](http://nightly.mozilla.org/) with the following
flags enabled via `about:config`:

    media.navigator.enabled: true
    media.peerconnection.enabled: true

### Install the project

    $ git clone https://github.com/tOkeshu/hibuddy.git
    $ cd hibuddy
    $ npm install

These commands should clone and pull the necessary dependencies.

### Configure Nginx

Here is a sample configuration for nginx:

    # /etc/nginx/sites-available/hibuddy.example.com
    server {
        listen   80;

        root /path/to/hibuddy/public;
        index index.html index.htm;

        server_name hibuddy.example.com;
        server_name_in_redirect off;

        proxy_buffering off;

        location / {
               proxy_pass http://127.0.0.1:6424;
        }
    }

Enable your site:

    # ln -s /etc/nginx/sites-available/fipes.example.com /etc/nginx/sites-enabled/hibuddy.example.com
    # /etc/init.d/nginx reload

### Start the server

    $ cd hibuddy
    $ node server.js # starts the server on port 6424

Then open a browser to http://hibuddy.example.com (where `hibuddy.example.com` is your domain).

If you just want to test the application on you machine, just edit your
`/etc/hosts`:

    # /etc/hosts
    127.0.1.1	hibuddy.example.com

### Production

For a more concrete deployment, we recommand you to use `forever`:

    # npm install -g forever # install forever system wide
    $ cd hibuddy
    $ forever -o logs/stdout.log -e logs/stderr.log start server.js
    $ forever stop server.js

See the [forever documentation](https://github.com/nodejitsu/forever)
for more information.

## License

HiBuddy is released under the terms of the
[GNU Affero General Public License v3](http://www.gnu.org/licenses/agpl-3.0.html)
or later.

