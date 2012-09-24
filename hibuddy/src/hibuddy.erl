-module(hibuddy).
-behaviour(application).

-export([start/0, start/2, stop/1]).
-define(PUBLIC, [<<"public">>]).


start() ->
    application:start(hibuddy).

% GET    /             => landing page
% POST   /rooms        => new room
% GET    /rooms/{room} => get into the room
% DELETE /rooms/{room} => destroy the room

% GET    /rooms        => not allowed
% POST   /rooms/{room} => not allowed

start(_Type, _Args) ->
    Routes =
        [{'_', [{[<<"rooms">>, room],   hibuddy_rooms, []},
                {[<<"static">>, '...'], cowboy_http_static,
                 [{directory, ?PUBLIC},
                  {mimetypes, {fun mimetypes:path_to_mimes/2, default}}]},
                {['...'],                                cowboy_http_static,
                 [{directory, ?PUBLIC},
                  {mimetypes, {fun mimetypes:path_to_mimes/2, default}}]}
               ]}],

    cowboy:start_listener(http,100,
                          cowboy_tcp_transport, [{port, 6424}],
                          cowboy_http_protocol, [{dispatch, Routes}]
                         ),
    cowboy:start_listener(https, 100,
                          cowboy_ssl_transport, [{port,     6425},
                                                 {certfile, "priv/ssl/cert.pem"},
                                                 {keyfile,  "priv/ssl/key.pem"},
                                                 {password, "cowboy"}],
                          cowboy_http_protocol, [{dispatch, Routes}]),
    hibuddy_sup:start_link().


stop(_State) ->
    ok.
