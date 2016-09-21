var React = require('react');
var Dropdown = require('./Dropdown.jsx');

module.exports = React.createClass({
	select: function(e){
		console.log("selected", e.target.value);
		this.props.handler.setOutputSink(e.target.value);
	},
	render: function(){
		var opts = this.props.liveLab.devices.audiooutput.map(function(dev){
			return {label: dev.label, value: dev.deviceId};
		});
		return <Dropdown {...this.props}  label={"audio output"} value={this.props.handler.audio.sinkId} options={opts} onChange={this.select}/>;
	}
});