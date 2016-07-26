var React = require('react');
var Landing = require('./Landing.jsx');
var ControlPanel = require('./ControlPanel.jsx');
var configData = require('./config.json');
var LiveLab = require('./LiveLabSimple.js');

module.exports = React.createClass({
	/*set room variables from config.json*/
	getInitialState: function(){
		return {room: configData.room, webrtc: null, dimensions: {w: 1280, h:720}};
	},
	/*check for room name in URL, and join room if not null*/
	componentDidMount: function(){
		var room = location.search && location.search.split('?')[1];
		this.liveLab = new LiveLab(configData, this);
		if(room) {
			//liveLab.joinRoom(room);
			this.setState({room: room});
		}
		this.setState({dimensions: {w: window.innerWidth, h: window.innerHeight}, webrtc: this.liveLab.webrtc.webrtc});
		window.onresize = function(){
			this.setState({dimensions: {w: window.innerWidth, h: window.innerHeight}});
		}.bind(this);
	}, 
/*	updateLocalStreams: function(streams){
		console.log(streams);
		this.setState({localStreams: streams});
	},
	updatePeers: function(peers){
		this.setState({peers:peers});
	},*/
	update: function(){
		this.setState({webrtc: this.liveLab.webrtc.webrtc})
	},
	render: function(){
		if(this.state.room == null){
			return <Landing />;
		} else {
			return <ControlPanel s={this.state} liveLab ={this.liveLab}/>;
		}
		
	}
});