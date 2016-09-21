var React = require('react');
var StreamContainer = require('./StreamContainer.jsx');

module.exports = React.createClass({
	getInitialState: function(){
		return {tracks: []};
	},
	componentDidMount: function(){
		// var tracks = this.props.stream.getTracks();
		// this.setState({tracks: tracks});
		
	},
	render: function(){
		var allStreams = this.props.streams.map(function(stream, i){
				return <StreamContainer {...this.props} w={this.props.liveLab.config.controlPanel.columnWidth} stream={stream.stream} handler={stream.handler} muted={true} key={i} />
			}.bind(this));

		var dataStreams = [];
		if(this.props.peer){
			for(var channel in this.props.peer.channels){
				//console.log("CHANNEL", channel);
				dataStreams.push(<div>{channel + ":" + JSON.stringify(this.props.peer.channels[channel])}</div>);
			}
		}
			return <div className="peer-container"> {allStreams}{dataStreams}</div>;
		
	}
});