# CaptionBee

CaptionBee is a Free Tool to help with embedding ClosedCaptions into your Livestream.
This is created out of Frustration about the current state of Tools and their Pricing,especially  for embedded Captions.


## Features
- Embed Captions pulled from Streamtext into OBS

## Config
Example Config.json : 
```
{
    "obsHost": "127.0.0.1",
    "obsPort": 4455,
    "obsPassword": "",
    "streamTextEvent": ""
}
```
## Usage
You will need to have the following : 
- Streamtext Account / Event ID
- OBS installed
- Web sockets enabled

1. Configure the Tool using Config.json
2. Configure OBS Websocket and set the port,host and password in Config.json
3. in OBS, go to Tools > Options > Captions (Experimental) and enable captions on a muted audio source via speech-to-text (don't worry, those bad captions will get overridden by this tool)
4. Your Ready, your human stenographer / live Captioner / CART provider should start sending to Streamtext.

## Development
Clone this Repository and then run the following commands:
 npm install 
 npm run build
 npm run dev


## Current Limitations

- Only supports Streamtext.
- Doesn't group text by words before sending
- Doesn't delay and doesn't allow for Editing

## Roadmap

We're actively working on improving CaptionBee. Here are some features in development:

- Directly Ingest Captions locally instead of going through StreamText
- Group text together and use a small delay for Corrections
- Testmode that sends Text for testing
- Control OBS streaming so that this all can be packed into Docker for Headless usage

## Aknowledges
Big Thanks go to the following Projects that CaptionBee is built on top of :

- [OBS Studio](https://github.com/obsproject/obs-studio) 
- [LibCaption](https://github.com/szatmary/libcaption) 
- [obs-websocket-streamtext-captions](https://github.com/EddieCameron/obs-websocket-streamtext-captions) 

## Alternative
If CaptionBee doesn't work for you check these out : 
- AcessLopp
- EEG Falcon
- SyncWords

## Contact

Please open an Issue for Feature Requests and Issues. 

---

Developed with ❤️ by ByteHive
