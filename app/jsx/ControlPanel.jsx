var React = require('react');
var StreamContainer = require('./StreamContainer.jsx');

module.exports = React.createClass({
	render: function(){
		var localVids = this.props.s.localStreams.map(function(stream, index){
			return <StreamContainer stream={stream} mute={true} key={index} dimensions={this.props.s.dimensions}/>
		}.bind(this));
		console.log("PEERS ", this.props.s.peers);
		var remoteVids = this.props.s.peers.map(function(peer, index){
			return <StreamContainer stream={peer.stream} mute={false} key={"peer_"+index} dimensions={this.props.s.dimensions}/>
		}.bind(this));
		return <div>
			{localVids}
			{remoteVids}
			</div>;
	}
});