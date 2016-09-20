var WebRTC = require('./webrtc');
var WildEmitter = require('wildemitter');
var webrtcSupport = require('webrtcsupport');
var SocketIoConnection = require('./../libs/socketioconnection');

function LiveLabRTC(opts) {
    var self = this;
   // var options = opts || {};
    var item, connection;

    // We also allow a 'logger' option. It can be any object that implements
    // log, warn, and error methods.
    // We log nothing by default, following "the rule of silence":
    // http://www.linfo.org/rule_of_silence.html
    this.logger = console;

    // set our config from options
    this.config = opts;

    // attach detected support for convenience
    this.capabilities = webrtcSupport;

    // call WildEmitter constructor
    WildEmitter.call(this);

   var connection = this.connection = new SocketIoConnection(this.config);

    connection.on('connect', function () {
        self.emit('connectionReady', connection.getSessionid());
         self.emit('readyToCall', self.connection.getSessionid());
    });

    connection.on('message', function (message) {
        var peers = self.webrtc.getPeers(message.from, message.roomType);
        var peer;

        if (message.type === 'offer') {
            if (peers.length) {
                peers.forEach(function (p) {
                    if (p.sid == message.sid) peer = p;
                });
            }

            if (!peer) {
                peer = self.webrtc.createPeer({
                    id: message.from,
                    sid: message.sid,
                    type: message.roomType,
                    enableDataChannels: true,
                    sharemyscreen: message.roomType === 'screen' && !message.broadcaster,
                    broadcaster: message.roomType === 'screen' && !message.broadcaster ? self.connection.getSessionid() : null
                });
                self.emit('createdPeer', peer);
            }
            peer.handleMessage(message);
        } else if (peers.length) {
            peers.forEach(function (peer) {
                if (message.sid) {
                    if (peer.sid === message.sid) {
                        peer.handleMessage(message);
                    }
                } else {
                    peer.handleMessage(message);
                }
            });
        }
    });

    connection.on('remove', function (room) {
        if (room.id !== self.connection.getSessionid()) {
            self.webrtc.removePeers(room.id, room.type);
        }
    });

    // instantiate our main WebRTC helper
    // using same logger from logic here
    opts.logger = this.logger;
    opts.debug = false;
    this.webrtc = new WebRTC(opts);

    // attach a few methods from underlying lib to simple.
    ['mute', 'unmute', 'pauseVideo', 'resumeVideo', 'pause', 'resume', 'sendToAll', 'sendDirectlyToAll', 'getPeers', 'sendDirectly'].forEach(function (method) {
        self[method] = self.webrtc[method].bind(self.webrtc);
    });

    // proxy events from WebRTC
    this.webrtc.on('*', function () {
        self.emit.apply(self, arguments);
    });

    // log all events in debug mode
   /* if (config.debug) {
        this.on('*', this.logger.log.bind(this.logger, 'LiveLabRTC event:'));
    }*/


   

    this.webrtc.on('message', function (payload) {
        self.connection.emit('message', payload);
    });

 
   /* connection.on('stunservers', function (args) {
        // resets/overrides the config
        self.webrtc.config.peerConnectionConfig.iceServers = args;
        self.emit('stunservers', args);
    });
    connection.on('turnservers', function (args) {
        // appends to the config
        self.webrtc.config.peerConnectionConfig.iceServers = self.webrtc.config.peerConnectionConfig.iceServers.concat(args);
        self.emit('turnservers', args);
    });*/

    this.webrtc.on('iceFailed', function (peer) {
        // local ice failure
    });
    this.webrtc.on('connectivityError', function (peer) {
        // remote ice failure
    });



    

    this.webrtc.on('additionalStream', function(streamObj){
        /*add new stream to peer connection object */
       // console.log("ADDING STREAMS");
        self.webrtc.peers.forEach(function (peer) {
          //   console.log("ADDING STREAMS");
            peer.addStream(streamObj.stream);
        });
    });

    if (this.config.autoRequestMedia) this.startLocalVideo();
}


LiveLabRTC.prototype = Object.create(WildEmitter.prototype, {
    constructor: {
        value: LiveLabRTC
    }
});

LiveLabRTC.prototype.leaveRoom = function () {
    if (this.roomName) {
        this.connection.emit('leave');
        while (this.webrtc.peers.length) {
            this.webrtc.peers.shift().end();
        }
        if (this.getLocalScreen()) {
            this.stopScreenShare();
        }
        this.emit('leftRoom', this.roomName);
        this.roomName = undefined;
    }
};

LiveLabRTC.prototype.addStream = function(constraints) {
    this.webrtc.addStream(constraints);
}

LiveLabRTC.prototype.disconnect = function () {
    this.connection.disconnect();
    delete this.connection;
};

LiveLabRTC.prototype.handlePeerStreamAdded = function (peer) {
    var self = this;

    this.emit('videoAdded', peer);
   
};


LiveLabRTC.prototype.joinRoom = function (name, cb) {
    var self = this;
    this.roomName = name;
    console.log("JOINIGN ROOM", name);
    this.connection.emit('join', name, function (err, roomDescription) {
        console.log('join CB', err, roomDescription);

        if (err) {
            self.emit('error', err);
        } else {
            var id,
                client,
                type,
                peer;
            for (id in roomDescription.clients) {
                client = roomDescription.clients[id];
                for (type in client) {
                    if (client[type]) {
                        peer = self.webrtc.createPeer({
                            id: id,
                            type: type,
                            enableDataChannels: true,
                            receiveMedia: {
                                offerToReceiveAudio: true,
                                offerToReceiveVideo: true
                            }
                        });
                        self.emit('createdPeer', peer);
                        peer.start();
                    }
                }
            }
        }

        if (cb) cb(err, roomDescription);
        self.emit('joinedRoom', name);
    });
};

LiveLabRTC.prototype.getEl = function (idOrEl) {
    if (typeof idOrEl === 'string') {
        return document.getElementById(idOrEl);
    } else {
        return idOrEl;
    }
};

LiveLabRTC.prototype.startLocalVideo = function () {
    var self = this;
    this.webrtc.startLocalMedia(this.config.media, function (err, stream) {
        if (err) {
            self.emit('localMediaError', err);
        } else {
            //attachMediaStream(stream, self.getLocalVideoContainer(), self.config.localVideo);
        }
    });
};

LiveLabRTC.prototype.stopLocalVideo = function () {
    this.webrtc.stopLocalMedia();
};


LiveLabRTC.prototype.shareScreen = function (cb) {
    this.webrtc.startScreenShare(cb);
};


// LiveLabRTC.prototype.testReadiness = function () {
//     var self = this;
//     if (this.sessionReady) {
//         if (!this.config.media.video && !this.config.media.audio) {
//             self.emit('readyToCall', self.connection.getSessionid());
//         } else if (this.webrtc.localStreams.length > 0) {
//             self.emit('readyToCall', self.connection.getSessionid());
//         }
//     }
// };

LiveLabRTC.prototype.createRoom = function (name, cb) {
    this.roomName = name;
    if (arguments.length === 2) {
        this.connection.emit('create', name, cb);
    } else {
        this.connection.emit('create', name);
    }
};

LiveLabRTC.prototype.sendFile = function () {
    if (!webrtcSupport.dataChannel) {
        return this.emit('error', new Error('DataChannelNotSupported'));
    }

};


module.exports = LiveLabRTC;
