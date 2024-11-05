import EventEmitter = require("events");
import {readFileSync} from 'jsonfile';
import { OBSWebSocket } from 'obs-websocket-js';
const request = require('request');
const MAX_SECONDS_PER_CAPTION = 6;
const MIN_CHAR_PER_CAPTION = 80;
export default class app extends EventEmitter{
    config: config;
    obs: OBSWebSocket;
    obsConnected: boolean;
    lastCaptionSendTime: number = Date.now();
    accumText: string = "";
    constructor(){
    super();
    this.loadConfig();
    this.obs = new OBSWebSocket();

    
}
private checkCaptionTimeoutBound: () => void;
    start(){
        this.obs.connect("ws://"+this.config.obsHost+":"+this.config.obsPort, this.config.obsPassword)
        .then(() => {
            console.log("Connected to OBS WebSockets server at ","ws://"+this.config.obsHost+":"+this.config.obsPort);
            this.obsConnected = true;
            this.makeRequest(0);
            this.lastCaptionSendTime = Date.now();
             this.checkCaptionTimeoutBound = this.checkCaptionTimeout.bind(this);
            setInterval(this.checkCaptionTimeoutBound, 1000);
        })
        .catch(err => {
            console.error(err);
        });
    }

    loadConfig(){
        //create empty config object
        this.config = {
            "obsPort": 4444,
            "obsHost": "localhost",
            "obsPassword": "password",
            "streamTextEvent": "streamText"
        };
        try{
            let config = readFileSync("config.json");
            this.config = config;
        }catch(e){
            console.log("No config file found");
        }
    }
     sendTextToObs(sendingText) {
        //if sending text is undefined, set it to "
        if (sendingText == undefined) {
            sendingText = "";
        }
        console.log("Sending caption to OBS: " + sendingText);
        this.obs.call("SendStreamCaption", { captionText: sendingText })
            .then(data => {
                 console.log("Captions sent to OBS: ",data);
            })
            .catch(error => {
                console.error(error,"in sendTextToObs");
                // try again
                setTimeout(() => {
                    this.sendTextToObs(sendingText);
                }, 2000);
            });
    }
    sendAccummulatedCaption() {
        if (!this.obsConnected) {
            console.log("OBS not connected, cannot send caption");
            return;
        }
        this.lastCaptionSendTime = Date.now();
        this. sendTextToObs(this.accumText);
        this.accumText = "";
    }
    checkCaptionTimeout() {
        console.log("Checking caption timeout...", Date.now() ,this.lastCaptionSendTime);
        if (Date.now() - this.lastCaptionSendTime > MAX_SECONDS_PER_CAPTION * 1000) {
            console.log("Too long between caption updates, sending current buffer!...")
            this.sendAccummulatedCaption()
        }
    }
    makeRequest(last) {
        var url = `https://www.streamtext.net/text-data.ashx?event=${this.config.streamTextEvent}&last=${last}`;
    
        const options = {
            url: url,
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Safari/605.1.15",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Connection": "keep-alive",
                "Accept-Encoding": "br, gzip, deflate",
                "Host": "www.streamtext.net"
            }
        };
        
        request(options, (error, res, body) => {
            if (error != null) {
                console.error(error);
                console.log("Error getting text. Trying again after timeout...");
                setTimeout(() => {
                    this.makeRequest(last);
                }, 1000);
            }
            else {
                var bodyJson = JSON.parse(body);
                if (bodyJson.hasOwnProperty("i") && bodyJson.i.length > 0) {
                    // was successful, send text to OBS and get next
                    bodyJson.i.forEach(element => {
                        var text = element.d;
                        text = decodeURIComponent(text);
                        
                        // console.log( `${last}: ${text}` )
                        this.appendCaptionFragment(text);
                    });
    
                    var newLast = res.headers['l_p']
                    setTimeout(() => {
                        this.makeRequest(newLast);                    
                    }, 500);
                    
                }
                else {
                    // no data wait and try again
                    console.log("No new text received. Trying again after timeout...");
                    setTimeout(() => {
                        this.makeRequest(last);
                    }, 1000);
                }
            }
        });
    }
    appendCaptionFragment(captionText) {
        console.log("adding text " + captionText);
        for (let i = 0; i < captionText.length; i++) {
            const c = captionText[i];
            if (c == '\b') {
                // backspace
                if (this.accumText.length > 0)
                    this.accumText = this.accumText.slice(0, this.accumText.length - 1);
            }
            else {
                this.accumText += c;
                if (c == ' ') {
                    // end of a word, try sending
                    if (this.accumText.length >= MIN_CHAR_PER_CAPTION) {
                        this.sendAccummulatedCaption();
                    }
                }
            }   
        }
    }
        
}


type config = {
    "obsPort": number,
    "obsHost": string,
    "obsPassword": string,
    "streamTextEvent": string,
}