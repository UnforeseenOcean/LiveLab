var MediaStreamRecorder = require('msr');
var SimpleWebRTC = require('./libs/simplewebrtc'); 
var LiveLabOsc = require('./LiveLabOsc');
var ChatWindow = require('./ChatWindow');
//var MicGainController = require('mediastream-gain'); // where is this used?
var PeerMediaContainer = require('./PeerMediaContainer');
var util = require("./util.js");
var SessionControl = require('./SessionControl');
var getScreenMedia = require("getscreenmedia");

//osc broadcast parameters, only available if running on localhost
var BASE_SOCKET_URL = "wss://localhost";
var BASE_SOCKET_PORT = 8000;
var LOCAL_SERVER;

if(window.location.host.indexOf("localhost") >= 0){
    LOCAL_SERVER = true;
} else {
    LOCAL_SERVER = false;
}
var webrtc, chatWindow, oscChannels, room, localMedia, dashboard, sessionControl, toolbar;

/*Global object containing data about all connected peers*/
var peers = {};
// state variable used to determine if this client has received
window.hasStateInfo = false;
window.localId = "";
window.interactivosRoom = "interactivoszia"

// structure of state info object:
// peers: list of peers, each peer has an id and a nick as following:
// {peers: [{id: SDsd8zjcxke23, nick: pablo}, {id: zxczxc9(qeasd, nick: ojack)}]}
window.stateInfo = {peers: []};

window.onload = start;

function start() {
    /*get room from URL*/
    room = location.search && location.search.split('?')[1];
    toolbar = document.createElement('div');
    toolbar.className = "toolbar";
    if(room) {
        if (room === window.interactivosRoom) {
            // remove the creation dialogue
            document.body.removeChild(document.getElementById("createRoom"));

            // create a video element to contain the local video
            var vid = document.createElement("video");
            vid.style = "display: none";
            vid.id = "video_local";
            document.body.appendChild(vid);
            stateInfo.peers.push({peer: "local", id: vid.id, video: vid});

            // create the canvas element that will contain & display all of the streams
            var canvas = document.createElement("canvas");
            canvas.id = "canvas";
            document.body.appendChild(canvas);

            // create the div that will contain all of the individual streams
            var containerDiv = document.createElement("div");
            containerDiv.id = "streams";
            document.body.appendChild(containerDiv);
            
            // create the video element that will house the recorded footage
            var recordedVid = document.createElement("video");
            recordedVid.style = "display: none";
            recordedVid.id = "video-recorded";
            recordedVid.autoplay = true;
            recordedVid.loop = true;
            recordedVid.muted = true; // doesn't appear to be set in the DOM, wtf

            var source1 = document.createElement("source");
            source1.src = "http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4"
            source1.type = "video/mp4";
            recordedVid.appendChild(source1);

            var source2 = document.createElement("source");
            source2.src = "http://clips.vorwaerts-gmbh.de/big_buck_bunny.webm"
            source2.type = "video/webm";
            recordedVid.appendChild(source2);

            document.body.appendChild(recordedVid);
            
            // initate everything
            initWebRTCInteractivosExhibit();
        } else {
            initWebRTC();
            setRoom(room);
        }
    } else {
        document.getElementById("createRoom").onsubmit = function() {
            var val = document.getElementById("sessionInput").value.toLowerCase().replace(/\s/g, '-').replace(/[^A-Za-z0-9_\-]/g, ''); 
            initWebRTC();

            webrtc.createRoom(val, function (err, name) {
                console.log('create room cb', arguments);
            
                var newUrl = location.pathname + '?' + name;
                if (!err) {
                    history.replaceState({foo: 'bar'}, null, newUrl);
                    setRoom(name);
                } else {
                    console.log(err);
                }
            });
            return false;   
        }
     }
}

function initWebRTCInteractivosExhibit() {
    stateInfo.numberOfParticipants = 1;

    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

    var cw = Math.floor(canvas.clientWidth);
    var ch = Math.floor(canvas.clientHeight);
    canvas.width = cw;
    canvas.height = ch;

    function createStreamVideo(vidSrc) {
        var streams = document.getElementById("streams");
        streams.appendChild(vidSrc); 
    }

    function draw(c, w, h) {
        // draw the smaller streams, sharing the top half of the screen
        for (var i = 0; i < stateInfo.peers.length; i++) { 
            var v = stateInfo.peers[i].video;
            if (v) {
                c.drawImage(v, w * i / stateInfo.numberOfParticipants, 0, w / stateInfo.numberOfParticipants, h / 2);
            }
        }

        // draw the large video stream
        // in the bottom half of the screen
        // NOTE: currently has a visual bug, with a border separating the two
        // portions of the canvas - dunno what is the cause
        //
        v = document.getElementById("video-recorded");
        c.drawImage(v, 0, h/2, w, h/2);
        setTimeout(draw, 20, c, w, h);
    }

    //TODO: 
    // * make sure the layout of everyone connecting is the same
    // * always stream the video in the bottom (via screen sharing)
    // * wait with drawing the local video until a peer has shared information
    //   about its position; or just read the roomDescription to calculate which
    //   position it has
    // * differentiate video stream of previous days from other peers
    // * use a different set of events to shareState; to prevent any potential
    //   collisions from e.g. someone using an old version & connecting to the
    //   interactivos room
    // * limit the number of participating streams; don't show their videos but
    //   allow them to see everything else
    // 
    // EVENTS:
    // interactivosState: 
    //   shares the state of all the peers and their ordering
    //   in the stream
    // iAmTheVideo:
    //   event that announces which peer contains the recorded footage stream;
    //   might not be needed if we just use screen sharing; but can be good to
    //   have as a smaller (very small, indeed) safeguard against malicious use
    console.log("launch interactivos version of the initwebrtc function"); 
    // first we initialize the webrtc client
    webrtc = new SimpleWebRTC({
       localVideoEl: "video_local",
       localVideo: {
               autoplay: true,
               mirror: false,
               muted: false
           },
       // the id/element dom element that will hold remote videos
       remoteVideosEl: '',
       // immediately ask for camera access
       autoRequestMedia: true,
       debug: false,
       detectSpeakingEvents: true,
       autoAdjustMic: false,
       adjustPeerVolume: false,
       peerVolumeWhenSpeaking: 1.0,
       media: {
         audio: {
           optional: [
          {googAutoGainControl: true}, 
           {googAutoGainControl2: true}, 
           {googEchoCancellation: true},
           {googEchoCancellation2: true},
           {googNoiseSuppression: true},
           {googNoiseSuppression2: true},
           {googHighpassFilter: true},
           {googTypingNoiseDetection: true},
           {googAudioMirroring: true}
           ]
         },
         video: {
           optional: [
           ]
         }
       }
    });
    
    webrtc.on('readyToCall', function () {
        window.localId = webrtc.connection.connection.id;
        if (room) webrtc.joinRoom(room);
        setTimeout(function() {draw(context, cw, ch)}, 1500);
    });

    webrtc.on('localScreenAdded', function (el) {
        console.log("localscreenadded");
        console.log(el);
         // var newPeer = new PeerMediaContainer("your screen", el, webrtc, dashboard);
        // peers["localScreenShare"] = newPeer;
    });

    webrtc.on("localScreenStopped", function (stream) {
        console.log("local screen stopped");
        // peers["localScreenShare"].destroy();
        // delete peers["localScreenShare"];
    });

    webrtc.on('channelMessage', function (peer, label, data) {
        console.log("channelMessage", label, data.type);
        if (data.type === "interactivosState"){
            // one of the peers changed the name of their window
            if (label === "shareState" && !window.hasStateInfo) {
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
        }
    });

     webrtc.on('videoAdded', function (video, peer) {
         console.log("VIDEO ADDED!");
         // TODO: check to make sure that the peer added wasn't the recorded video stream
         stateInfo.numberOfParticipants++;
         video.style = "display: none";
         video.id = "stream-" + stateInfo.numberOfParticipants;
         createStreamVideo(video);
         stateInfo.peers.push({peer: peer, id: peer.id, video: video});

         setTimeout(function() {
             // webrtc.sendDirectlyToAll("shareState", "interactivosState", 15);
         }, 3500);
     });

    var self = this;
    webrtc.on('videoRemoved', function (video, peer) {
         // TODO: check to make sure that the peer remove wasn't the video footage
        stateInfo.numberOfParticipants--;
        console.log("video removed");
        // update id of all video elements: decrement by one if their id was
        // larger than that of the id that just left, otherwise leave the id
        // alone
    });
}

function initWebRTC(){
    dashboard = document.createElement('div');
    dashboard.setAttribute("id", "dashboard");
    document.body.appendChild(dashboard);

    // first we initialize the webrtc client
    webrtc = new SimpleWebRTC({
       // the id/element dom element that will hold our video;
       // it's ok to initialize this to "video_local" as we in all cases
       // have the local window 
       localVideoEl: "video_local",
       localVideo: {
               autoplay: true,
               mirror: false,
               muted: false
           },
       nick: localStorage.getItem("livelab-localNick") || window.localId,
       // the id/element dom element that will hold remote videos
       remoteVideosEl: '',
       // immediately ask for camera access
       autoRequestMedia: true,
       debug: false,
       detectSpeakingEvents: true,
       autoAdjustMic: false,
       adjustPeerVolume: false,
       peerVolumeWhenSpeaking: 1.0,
       media: {
         audio: {
           optional: [
          {googAutoGainControl: true}, 
           {googAutoGainControl2: true}, 
           {googEchoCancellation: true},
           {googEchoCancellation2: true},
           {googNoiseSuppression: true},
           {googNoiseSuppression2: true},
           {googHighpassFilter: true},
           {googTypingNoiseDetection: true},
           {googAudioMirroring: true}
           ]
         },
         video: {
           optional: [
           ]
         }
       }
    });
    // then we create the divs to contain & display the media streams
    localMedia = new PeerMediaContainer("local", null, webrtc, dashboard);
    
    if(LOCAL_SERVER){
        var osc_config = {
            "socket_port": BASE_SOCKET_PORT,
            "socket_url": BASE_SOCKET_URL
        }; 

        oscChannels = new LiveLabOsc(osc_config.socket_port, webrtc, localMedia.dataDiv, osc_config.socket_url, peers);
    } else {
          oscChannels = new LiveLabOsc(null, webrtc, localMedia.dataDiv, null, peers);
    }

    webrtc.on('readyToCall', function () {
        window.localId = webrtc.connection.connection.id;
        if (room) webrtc.joinRoom(room);
        chatWindow = new ChatWindow(document.body, webrtc);
        localMedia.addVideoControls();
        sessionControl = new SessionControl(localMedia.video, document.body, peers, webrtc);
        addToolbarButton("Chat", chatWindow);
        addToolbarButton("Session Control", sessionControl);
        localMedia.video.addEventListener("click", function(e){
            console.log("setting video ", e.target);
            sessionControl.setVideo(e.target);
        });
    });

    webrtc.on('localScreenAdded', function (el) {
        console.log(el);
         var newPeer = new PeerMediaContainer("your screen", el, webrtc, dashboard);
        peers["localScreenShare"] = newPeer;
    });

    webrtc.on("localScreenStopped", function (stream) {
        peers["localScreenShare"].destroy();
        delete peers["localScreenShare"];
    });

    webrtc.on('channelMessage', function (peer, label, data) {
        if (data.type=="chat") {
            var name = document.getElementById("header_" + peer.id).innerHTML;
            chatWindow.appendToChatLog(name, data.payload);
        } else if (data.type=="osc") {
            oscChannels.receivedRemoteStream(data, peer.id, label);
            sessionControl.oscParameter(data.payload);
        } else if (data.type === "sessionInfo"){
            // one of the peers changed the name of their window
            if (label === "nameChange") {
                // update the header of the peer that changed their name
                document.getElementById("header_" + peer.id).innerHTML = util.escapeText(data.payload);
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
            sessionControl.remoteCodeChange(data.payload);
        } else if(data.type=="mixer"){
            console.log("MIXER", label, data);
            sessionControl.remoteMixerEvent(label, data.payload);
        }
    });

     webrtc.on('videoAdded', function (video, peer) {
         /*add new peer to peer object*/
         var newPeer = new PeerMediaContainer(peer.id, video, webrtc, dashboard);
         peers[peer.id] = {peer: peer, peerContainer: newPeer, dataStreams: {}};
         newPeer.video.addEventListener("click", function(e){
             console.log("setting video ", e.target);
             sessionControl.setVideo(e.target);
        });

         if (window.hasStateInfo) {
             // check to see if the new peer resides inside the peers list of
             // the window.stateInfo object. if not: add it
             var peerExists = false;
             window.stateInfo.peers.forEach(function(existingPeer) {
                 if (peer.id === existingPeer.id) {
                     peerExists = true;
                     return;
                 }
             });

             if (!peerExists) {
                 window.stateInfo.peers.push({id: peer.id, nick: peer.nick});
             }
             // send the state information to everyone 
             // TODO: preferably only send it to the connected peer
             setTimeout(function() {
                 webrtc.sendDirectly(peer.id, "shareState", "sessionInfo", JSON.stringify(window.stateInfo));
             }, 2500);
         } else {
             // don't do shit
         }
        // update the newly connected peer with the session info for this
        // channel
        // {collect session info somehow}
     });

    var self = this;
    webrtc.on('videoRemoved', function (video, peer) {
        var index = -1;
        for (var i = 0; i < window.stateInfo.peers.length; i++) {
            var existingPeer = window.stateInfo.peers[i];
            if (peer.id === existingPeer.id) {
                index = i;
                break;
            }
        }
        // remove the peer from the stateInfo object
        window.stateInfo.peers.splice(index, 1);
        var peerObj = peers[peer.id];
        peerObj.peerContainer.destroy();
        delete peers[peer.id];
    });
}

function setRoom(name) {
    document.body.removeChild(document.getElementById("createRoom"));
   // document.getElementById("title").innerHTML = name;
   
    var title = document.createElement('div');
    title.innerHTML = name;
    title.id = "title";
    toolbar.appendChild(title);
    document.body.appendChild(toolbar);
}

function addToolbarButton(name, element){
    var b = document.createElement('input');
    b.className = "toolbar-button";
    b.type = 'button';
    b.value = name;
    toolbar.appendChild(b);
    b.onclick = element.toggle.bind(element);
}
