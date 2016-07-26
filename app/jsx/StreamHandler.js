/* class to process stream, including:
create webAudio node*/

function StreamHandler(peer, context, update, parent){
   console.log("STREAM PROCESSING", peer);
   this.stream = peer.stream;
   this.tracks = peer.stream.getTracks();
   this.hasAudio = false;
   this.hasVideo = false;
   this.context = context;
   this.volume = 1.0;
   this.muted = true;
    console.log("UPDATE", update);
   this.update = update.bind(parent);
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
    console.log("AUDIO", audio.muted);
  };

StreamHandler.prototype.toggleMute = function(){
  this.muted = this.muted ? false: true;
  this.audio.muted = this.muted;
 console.log("UPDATE", this.update);
  this.update();
}

StreamHandler.prototype.setAudioSink = function(id){

};

StreamHandler.prototype.setVolume = function(vol){

}

module.exports = StreamHandler;
