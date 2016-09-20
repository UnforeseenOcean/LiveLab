var React = require('react');
var StreamContainer = require('./StreamContainer.jsx');
var MenuBar = require('./MenuBar.jsx');

module.exports = React.createClass({
	render: function(){
		var localVids = this.props.liveLab.localStreams.map(function(stream, index){
			return <StreamContainer {...this.props} stream={stream.stream} handler={stream.handler} muted={true} key={index} />
		}.bind(this));
		var remoteVids = this.props.liveLab.peers.map(function(peer, index){
			var allStreams = peer.streams.map(function(stream, i){
				return <StreamContainer {...this.props} stream={stream.stream} handler={stream.handler} muted={true} key={"peer_"+index+"_"+i} />
			}.bind(this));
			return <div> {allStreams}</div>;
		}.bind(this));
		return <div>
			{localVids}
			{remoteVids}
			<MenuBar {...this.props} />
			</div>;
	}
});