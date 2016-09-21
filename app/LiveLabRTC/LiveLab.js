var LiveLabRTC = require('./LiveLabRTC.js'); 
var LiveLabOsc = require('./LiveLabOsc.js'); 
var StreamHandler = require('./StreamHandler.js');
var config = require('./../config.json');

var BASE_SOCKET_URL = "wss://localhost";
var BASE_SOCKET_PORT = 8000;
var LOCAL_SERVER;


/* Main object for LiveLab. All of information about current connected streams is stored in the arrays
this.localStreams and this.peers */ 
function LiveLab(update){
  /*init webrtc based on settings defined in config.json */

    var webrtc = new LiveLabRTC(config.rtc);
    this.config = config;
    //console.log("WEBRTC", webrtc);

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

    /*function to update render cycle when code has changed */
    this.update = update;
   

    this.initLocalStorage();
    this.initWebAudio();
    this.getOutputDevices();

    if(window.location.host.indexOf("localhost") >= 0){
      LOCAL_SERVER = true;

    } else {
      LOCAL_SERVER = false;
    }

     var osc_config = {
            "socket_port": BASE_SOCKET_PORT,
            "socket_url": BASE_SOCKET_URL
        }; 

    this.oscChannels = new LiveLabOsc(osc_config.socket_port, webrtc, osc_config.socket_url);
   /*init webRTC event handlers */
    this.webrtc = webrtc;
    webrtc.on('readyToCall', function () {
       // console.log(webrtc);
       this.localStreams = webrtc.webrtc.localStreams;
        window.localId = webrtc.connection.connection.id;
         var streamHandler = new StreamHandler(this.localStreams[0], this.audioContext, this);
        this.update();
        if (this.room) webrtc.joinRoom(this.room);
        console.log("local streams ", this.localStreams);
        
    }.bind(this));



    webrtc.on('localScreenAdded', function (el) {
      // to do: add to local screens list
    });

    webrtc.on("localScreenStopped", function (stream) {
        // to do: add to local screens list
    });

    /* new local stream is added */
     this.webrtc.on('additionalStream', function (streamObj) {
        console.log("new additional stream");
        var streamHandler = new StreamHandler(streamObj, this.audioContext, this);
      //  
      
      this.update();
    }.bind(this));

    webrtc.on('channelMessage', function (peer, label, data) {
       // console.log("received channel message");
        if (data.type=="chat") {
            // var name = document.getElementById("header_" + peer.id).innerHTML;
            // chatWindow.appendToChatLog(name, data.payload);

            //chat add to state
        } else if (data.type=="osc") {
            //this.oscChannels.receivedRemoteStream(data, peer.id, label);
            //this.peers[peer.id]
            // sessionControl.oscParameter(data.payload);
         //var ch = this.peers[peer.id].channels;
        
         var p;
         for(var i = 0; i < this.peers.length; i++){
          if(this.peers[i].id == peer.id){
            p = this.peers[i];
            p.channels[label] = data;
            // console.log(p);
          }
         }
         this.update();
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
           // console.log("MIXER", label, data);
           // sessionControl.remoteMixerEvent(label, data.payload);
        }
    }.bind(this));
  
  webrtc.on('peerStreamAdded', function(streamObj){
   // console.log("PEER STREAM ADDED", streamObj);
    var streamHandler = new StreamHandler(streamObj, this.audioContext, this);
    //console.log("PEER ADDED", this.peers);
      //console.log(peer);
    // console.log(this.webrtc);
    this.getStats();
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
  let supported = navigator.mediaDevices.getSupportedConstraints();

  //console.log("CONSTRAINTS", supported);
  navigator.mediaDevices.enumerateDevices()
  .then(function(MediaDeviceInfo) { 
    for(var i = 0; i < MediaDeviceInfo.length; i++){
      var device = MediaDeviceInfo[i];
      devices[device.kind].push(device);
    }
    this.devices = devices;
   // console.log(this);
  }.bind(this));
}

LiveLab.prototype.initWebAudio = function(){
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  this.audioContext = new AudioContext();

}

LiveLab.prototype.newStream = function(constraints){
  this.webrtc.addStream(constraints);
}

LiveLab.prototype.newDataChannel = function(props){
 // console.log("ADD STREAM ", constraints);
  this.oscChannels.addDataChannel(props);
  console.log(this.peers);
}

LiveLab.prototype.getStats = function(){
  //this.peers.map(function(peer){
   // console.log(peer.getStats(function(err, res){
      //console.log("STATS ERR", err);
     // console.log("STATS RES", res);
    
 // });
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
