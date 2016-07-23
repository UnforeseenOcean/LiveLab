var React = require('react');
var VideoContainer = require('./VideoContainer.jsx');

module.exports = React.createClass({
	render: function(){
		var localVids = this.props.sessionState.localStreams.map(function(stream, index){
			return <VideoContainer stream={stream} mute={true} key={index}/>
		});
		console.log("PEERS ", this.props.sessionState.peers);
		var remoteVids = this.props.sessionState.peers.map(function(peer, index){
			return <VideoContainer stream={peer.stream} mute={false} key={"peer_"+index}/>
		});
		return <div>
			{this.props.sessionState.room}
			{localVids}
			{remoteVids}
			</div>;
	}
});