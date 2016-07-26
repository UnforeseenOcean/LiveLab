var React = require('react');
var StreamContainer = require('./StreamContainer.jsx');

module.exports = React.createClass({
	render: function(){
		console.log("PROPS", this.props.s);
		var localVids = this.props.s.webrtc.localStreams.map(function(stream, index){
			return <StreamContainer stream={stream.stream} handler={stream.handler} muted={true} key={index} dimensions={this.props.s.dimensions} liveLab={this.props.liveLab}/>
		}.bind(this));
		console.log("PEERS ", this.props.s);
		var remoteVids = this.props.s.webrtc.peers.map(function(peer, index){
			return <StreamContainer stream={peer.stream} handler={peer.handler} muted={true} key={"peer_"+index} dimensions={this.props.s.dimensions} liveLab={this.props.liveLab}/>
		}.bind(this));
		return <div>
			{localVids}
			{remoteVids}
			</div>;
	}
});