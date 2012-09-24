-module(hibuddy_rooms).
-behaviour(cowboy_http_handler).
-behaviour(cowboy_http_websocket_handler).

-export([init/3, handle/2, terminate/2]).
-export([websocket_init/3, websocket_handle/3,
         websocket_info/3, websocket_terminate/3]).


init({_Any, http}, Req, []) ->
    case cowboy_http_req:header('Upgrade', Req) of
        {undefined, Req2} -> {ok, Req2, []};
        {<<"websocket">>, _Req2} -> {upgrade, protocol, cowboy_http_websocket};
        {<<"WebSocket">>, _Req2} -> {upgrade, protocol, cowboy_http_websocket}
    end.


handle(Req, State) ->
    {ok, Req2} = dispatch(Req),
    {ok, Req2, State}.


dispatch(Req) ->
    fail(Req).


fail(Req) ->
    case cowboy_http_req:binding(room, Req) of
        %% /rooms => 405 Method Not Allowed
        {undefined, Req} ->
            cowboy_http_req:reply(405, [], <<"">>, Req);
        %% /rooms/:room => Only supports websockets
        {<<"flux">>, Req} ->
            ets:insert(watchers, {self(), self()}),
            Headers = [{<<"Content-Type">>, <<"multipart/x-mixed-replace; boundary=--guillotine">>}],
            {ok, Req2} = cowboy_http_req:chunked_reply(200, Headers, Req),
            stream(Req2)
    end.

stream(Req) ->
    receive
        {frame, Image} ->
            Payload = [<<"--guillotine\r\n">>,
                       <<"Content-Type: image/jpeg\r\n">>,
                       <<"Content-Length: ">>, integer_to_list(size(Image)), <<"\r\n">>,
                       <<"\r\n">>,
                       Image, <<"\r\n">>],
            cowboy_http_req:chunk(Payload, Req)
    end,
    stream(Req).

terminate(_Req, _State) ->
    ets:delete(watchers, {w, self()}),
    ok.

%% websockets

websocket_init(_Any, Req, []) ->
    {ok, Req, undefined, hibernate}.

websocket_handle({text, DataURL}, Req, State) ->
    <<"data:image/jpeg;base64,", Base64Image/binary>> = DataURL,
    Image = base64:decode(Base64Image),
    [Watcher ! {frame, Image} ||
        {_Key, Watcher} <- ets:tab2list(watchers)],
    {ok, Req, State};
websocket_handle(_Any, Req, State) ->
    {ok, Req, State}.

websocket_info(_Info, Req, State) ->
    {ok, Req, State, hibernate}.

websocket_terminate(_Reason, _Req, _State) ->
    ok.

