var React = require('react');
var StreamContainer = require('./StreamContainer.jsx');
var PeerContainer = require('./PeerContainer.jsx');
var MenuBar = require('./MenuBar.jsx');

module.exports = React.createClass({
	render: function(){
		var localVids = <PeerContainer {...this.props} streams={this.props.liveLab.localStreams}  />;
		var peers = this.props.liveLab.peers.map(function(peer, index){
			return <PeerContainer {...this.props} streams={peer.streams} peer={peer} key={"peer_"+index} />
		}.bind(this));

		return <div>
			{localVids}
			{peers}
			<MenuBar {...this.props} />
			</div>;
	}
});