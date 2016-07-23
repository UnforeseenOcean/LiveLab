var React = require('react');
var Landing = require('./Landing.jsx');
var ControlPanel = require('./ControlPanel.jsx');
var configData = require('./config.json');
var LiveLab = require('./LiveLabSimple.js');

module.exports = React.createClass({
	/*set room variables from config.json*/
	getInitialState: function(){
		return {room: configData.room, localStreams: [], peers:[], dimensions: {w: 1280, h:720}};
	},
	/*check for room name in URL, and join room if not null*/
	componentDidMount: function(){
		var room = location.search && location.search.split('?')[1];
		var liveLab = new LiveLab(configData, this);
		if(room) {
			//liveLab.joinRoom(room);
			this.setState({room: room});
		}
		window.onresize = function(){
			this.setState({dimensions: {w: window.innerWidth, h: window.innerHeight}});
		}.bind(this);
	}, 
	updateSessionParams: function(update){
		this.setState({update});
	},
	addLocalStream: function(stream){
		var localStreams = this.state.localStreams;
		localStreams.push(stream);
		console.log(localStreams);
		this.setState({localStreams: localStreams});

	},
	updatePeers: function(peers){
		this.setState({peers:peers});
	},
	render: function(){
		if(this.state.room == null){
			return <Landing />;
		} else {
			return <ControlPanel s={this.state}/>;
		}
		
	}
});