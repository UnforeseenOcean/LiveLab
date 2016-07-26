var React = require('react');
var StreamContainer = require('./StreamContainer.jsx');

module.exports = React.createClass({
	render: function(){
		var localVids = this.props.liveLab.localStreams.map(function(stream, index){
			return <StreamContainer {...this.props} stream={stream.stream} handler={stream.handler} muted={true} key={index} />
		}.bind(this));
		var remoteVids = this.props.liveLab.peers.map(function(peer, index){
			return <StreamContainer {...this.props} stream={peer.stream} handler={peer.handler} muted={true} key={"peer_"+index} />
		}.bind(this));
		return <div>
			{localVids}
			{remoteVids}
			</div>;
	}
});