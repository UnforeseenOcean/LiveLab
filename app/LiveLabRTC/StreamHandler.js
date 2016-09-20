/* class to process stream, including:
create webAudio node*/

function StreamHandler(peer, context, parent){
  // console.log("STREAM PROCESSING", peer);
   this.stream = peer.stream;
   this.tracks = peer.stream.getTracks();
   this.hasAudio = false;
   this.hasVideo = false;
   this.context = context;
   this.volume = 1.0;
   this.muted = true;
   this.parent = parent;
  
  
      /* Check whether stream contains video or audio or both*/
   for(var i = 0; i < this.tracks.length; i++){
    if(this.tracks[i].kind=="audio") this.hasAudio = true;
    if(this.tracks[i].kind=="video") this.hasVideo = true;
   }
   peer.handler = this;

   if(this.hasAudio) this.connectToWebAudio();
   if(peer.hasOwnProperty.sid){
    //this.toggleMute();
   }
}

  StreamHandler.prototype.connectToWebAudio = function(){
    var input = this.context.createMediaStreamSource(this.stream);
   
    var output = this.context.createMediaStreamDestination();
    input.connect(output);

    var audio = new Audio();
    audio.src = URL.createObjectURL(output.stream);
   
    audio.volume = this.volume;
    audio.muted = true;
     audio.play();

    this.audio = audio;
    var id = audio.sinkId;
    this.sinkId = null;
    console.log("AUDIO",id);
  };

StreamHandler.prototype.toggleMute = function(){
  this.muted = this.muted ? false: true;
  this.audio.muted = this.muted;
 //console.log("UPDATE", this.update);
  this.parent.update();
}

StreamHandler.prototype.setOutputSink = function(id){
  // attachSinkId(this.audio, id, function(){
  //   this.update();
  // }.bind(this));
  this.attachSinkId(id);
};

StreamHandler.prototype.setVolume = function(vol){

}

// Attach audio output device to the provided media element using the deviceId.
StreamHandler.prototype.attachSinkId = function(sinkId) {
  var element = this.audio;
  var self = this;
  if (typeof element.sinkId !== 'undefined') {
    element.setSinkId(sinkId)
    .then(function() {
      console.log('Success, audio output device attached: ' + sinkId + ' to ' +
          'element with ' + element.id + ' as source.');
      self.parent.update();
    })
    .catch(function(error) {
      var errorMessage = error;
      if (error.name === 'SecurityError') {
        errorMessage = 'You need to use HTTPS for selecting audio output ' +
            'device: ' + error;
      }
      console.error(errorMessage);
      // Jump back to first output device in the list as it's the default.
      
    });
  } else {
    console.warn('Browser does not support output device selection.');
  }
}
module.exports = StreamHandler;
