import ResponseProtocol from "../net/ResponseProtocol";
import RequestProtocol from "../net/RequestProtocol";
import GameMessageBase, { GameMessageType, GameMessageMatchOver } from "../net/GameMessageBase";
import EventManager from "./EventManager";
import GameEvent from "../events/GameEvent";
import GameDataManager from "./GameDataManager";

export default class NetManager
{

    private static _instance:NetManager;
    public static getInstance():NetManager
    {
        if (this._instance == null)
        {
            this._instance = new NetManager();
        }
        return this._instance;
    }

    public static destoyInstance()
    {
        NetManager._instance = null;
    };

    init() 
    {
        NetManager._instance = this;
    }  

    private ws:WebSocket = null;
    private wsUrl:string = "ws:/192.168.200.66:8080";
    connectWebScoket() 
    {
        let ws = new WebSocket(NetManager.getInstance().wsUrl);
        ws.onopen = (evt: MessageEvent) => {
            let msg = JSON.stringify({type:GameMessageType.Hello});
            ws.send(msg);
            EventManager.dispatchEvent(GameEvent.Server_Connected);            
        };

        ws.onmessage = (evt: MessageEvent) => {
            let msg = JSON.parse(evt.data) as GameMessageBase;
            NetManager.getInstance().onMessageResponse(msg);
        };
        
        this.ws = ws;
    }

    sendWebSocket(msg:GameMessageBase)
    {
        let str = JSON.stringify(msg);
        console.log("sendWebSocket:", str, this.ws);
        NetManager.getInstance().ws.send(str);
    }

    onMessageResponse(msg:GameMessageBase)
    {
        // console.log('onMessageResponse:', msg , GameMessageType.S2C_Login);
        switch(msg.type)
        {
            case GameMessageType.S2C_Login:
                EventManager.dispatchEvent(GameEvent.Login_Response, msg);
                break;

            case GameMessageType.S2C_Regist:
                EventManager.dispatchEvent(GameEvent.Register_Response, msg);
                break;

            case GameMessageType.S2C_MatchOver:
                GameDataManager.updateMatchOver(msg as GameMessageMatchOver);
                EventManager.dispatchEvent(GameEvent.Match_Response, msg);
                break;
            case GameMessageType.Put:
                EventManager.dispatchEvent(GameEvent.Fight_Response, msg);
                break;
        }
    }

    getNet(url, path, params, callback):XMLHttpRequest
    {
        var xhr = new XMLHttpRequest();
        xhr.timeout = 5000;
        var requestURL = url + path;
        if (params)
        {
            requestURL = requestURL + "?" + params;
        }
        
        console.log("requestURL:", requestURL);
        xhr.open("GET",requestURL, true);
        
        if (cc.sys.isNative)
        {
            // xhr.setRequestHeader("Accept-Encoding","gzip,deflate","text/html;charset=UTF-8");
        }
        xhr.onreadystatechange = function() 
        {
            if(xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300))
            {
                try 
                {
                    var ret = xhr.responseText;
                    if(callback !== null)
                    {
                        callback(null, ret);
                    }
                    return;
                } 
                catch (e) 
                {
                    callback(e, null);
                }
            }
            else if(xhr.status == 0)
            {
                callback(xhr.status, null);
            }
        };
        xhr.send();
        return xhr;
    }

    post(url, path, params, body, callback) 
    {
        var xhr = cc.loader.getXMLHttpRequest();
        xhr.timeout = 5000;
        var requestURL = url + path;
        if (params) {
            requestURL = requestURL + "?" + params;
        }
        xhr.open("POST",requestURL, true);
        if (cc.sys.isNative){
            // xhr.setRequestHeader("Accept-Encoding","gzip,deflate","text/html;charset=UTF-8");
        }

        if (body) {
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.setRequestHeader("Content-Length", body.length);
        }
        

        xhr.onreadystatechange = function() {
            if(xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)){
                try {
                    var ret = xhr.responseText;
                    if(callback !== null){
                        callback(null, ret);
                    }
                    return;
                } catch (e) {
                    callback(e, null);
                }
            }
            else {
                callback(xhr.readyState + ":" + xhr.status, null);
            }
        };
        if (body) {
            xhr.send(body);
        }
        return xhr;
    }
}
