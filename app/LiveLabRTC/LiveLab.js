var LiveLabRTC = require('./LiveLabRTC.js'); 
var StreamHandler = require('./StreamHandler.js');
var config = require('./../config.json');

/* Main object for LiveLab. All of information about current connected streams is stored in the arrays
this.localStreams and this.peers */ 
function LiveLab(update){
  /*init webrtc based on settings defined in config.json */

    var webrtc = new LiveLabRTC(config.rtc);
    console.log("WEBRTC", webrtc);

    /* localStreams is an array of objects containing the local media:
      {
        stream: <MediaStreamObject>,
        handler: <StreamHandlerObject>
    }
    */
    this.localStreams = webrtc.webrtc.localStreams;

     /* peers is an array of objects containing peer streams:
      {
        stream: <MediaStreamObject>,
        id: <peer id>,
        handler: <StreamHandlerObject>,
        pc: <rtcpeerconnection>,
        channels: <array of data channels>
    }
    */
    this.peers = webrtc.webrtc.peers;

    /* get room name from url. TO DO: read from config.json */
    var room = location.search && location.search.split('?')[1];
    this.room = room;

    /*function to update render cycle when code as changed */
    this.update = update;
   

    this.initLocalStorage();
    this.initWebAudio();
    this.getOutputDevices();

   /*init webRTC event handlers */
    this.webrtc = webrtc;
    webrtc.on('readyToCall', function () {
        console.log(webrtc);
        this.localStreams = webrtc.webrtc.localStreams;
        window.localId = webrtc.connection.connection.id;
        if (this.room) webrtc.joinRoom(this.room);
         var streamHandler = new StreamHandler(this.localStreams[0], this.audioContext, this);
        this.update();
    }.bind(this));

    webrtc.on('localScreenAdded', function (el) {
      // to do: add to local screens list
    });

    webrtc.on("localScreenStopped", function (stream) {
        // to do: add to local screens list
    });

    /* new local stream is added */
     this.webrtc.on('additionalStream', function (streamObj) {
        
       // console.log("STREAM" ,streamObj);
        //console.log("STREAM" ,this.webrtc);
      //  var tracks = streamObj.stream.getTracks();
      //  console.log(tracks);
        var streamHandler = new StreamHandler(streamObj, this.audioContext, this);
      //  
      console.log(this);
      this.update();
    }.bind(this));

    webrtc.on('channelMessage', function (peer, label, data) {
        if (data.type=="chat") {
            // var name = document.getElementById("header_" + peer.id).innerHTML;
            // chatWindow.appendToChatLog(name, data.payload);

            //chat add to state
        } else if (data.type=="osc") {
            // oscChannels.receivedRemoteStream(data, peer.id, label);
            // sessionControl.oscParameter(data.payload);
        } else if (data.type === "sessionInfo"){
            // one of the peers changed the name of their window
            if (label === "nameChange") {
                // update the header of the peer that changed their name
                //document.getElementById("header_" + peer.id).innerHTML = util.escapeText(data.payload);
            } else if (label === "shareState" && !window.hasStateInfo) {
                // update the state of this client to reflect the state of the room
                window.stateInfo = JSON.parse(data.payload);
                window.hasStateInfo = true;
                // reflect the changes in the browser
                window.stateInfo.peers.forEach(function(existingPeer) {
                    if (existingPeer.id !== localId && existingPeer.nick) {
                        document.getElementById("header_" + existingPeer.id).innerHTML = util.escapeText(existingPeer.nick);
                    }
                });
            }
        } else if(data.type=="code-lab"){
           // sessionControl.remoteCodeChange(data.payload);
        } else if(data.type=="mixer"){
            console.log("MIXER", label, data);
           // sessionControl.remoteMixerEvent(label, data.payload);
        }
    });
  
  webrtc.on('peerStreamAdded', function(streamObj){
   // console.log("PEER STREAM ADDED", streamObj);
    var streamHandler = new StreamHandler(streamObj, this.audioContext, this);
    //console.log("PEER ADDED", this.peers);
      //console.log(peer);
    // console.log(this.webrtc);
    this.update();

  }.bind(this));

    var self = this;
    webrtc.on('peerStreamRemoved', function (peer) {
         this.update();
         /*TO DO: is any garbage collecting/ cleanup necessary on stream?*/
    }.bind(this));
}


LiveLab.prototype.getOutputDevices = function(){
  var devices = {};
  devices.videoinput = [];
  devices.audioinput = [];
  devices.audiooutput = [];
  navigator.mediaDevices.enumerateDevices()
  .then(function(MediaDeviceInfo) { 
    for(var i = 0; i < MediaDeviceInfo.length; i++){
      var device = MediaDeviceInfo[i];
      devices[device.kind].push(device);
    }
    this.devices = devices;
    console.log(this);
  }.bind(this));
}

LiveLab.prototype.initWebAudio = function(){
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  this.audioContext = new AudioContext();

}

LiveLab.prototype.newStream = function(constraints){
 // console.log("ADD STREAM ", constraints);
  this.webrtc.addStream(constraints);
}

LiveLab.prototype.initLocalStorage = function(){
   window.hasStateInfo = false;
window.localId = "";

// structure of state info object:
// peers: list of peers, each peer has an id and a nick as following:
// {peers: [{id: SDsd8zjcxke23, nick: pablo}, {id: zxczxc9(qeasd, nick: ojack)}]}
window.stateInfo = {peers: []};

}

module.exports = LiveLab;
