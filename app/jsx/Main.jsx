var React = require('react');
var Landing = require('./Landing.jsx');
var ControlPanel = require('./ControlPanel.jsx');

var LiveLab = require('./LiveLab.js');

module.exports = React.createClass({
	/*set room variables from config.json*/
	getInitialState: function(){
		return {liveLab: null, dimensions: {w: 1280, h:720}};
	},
	/*check for room name in URL, and join room if not null*/
	componentDidMount: function(){
		this.liveLab = new LiveLab(this.update);
		this.setState({dimensions: {w: window.innerWidth, h: window.innerHeight}, liveLab: this.liveLab});
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
		this.setState({liveLab: this.liveLab})
	},
	render: function(){
		if(this.state.liveLab == null){
			return <Landing dimensions={this.state.dimensions} />;
		} else {
			return <ControlPanel dimensions={this.state.dimensions} liveLab ={this.state.liveLab}/>;
		}
	}
});