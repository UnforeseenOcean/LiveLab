var React = require('react');
var ReactDOM = require('react-dom');

var OutputSettings = require('./OutputSettings.jsx');
var Slider = require('./Slider.jsx');

module.exports = React.createClass({
	getInitialState: function(){
		return({showSettings: false, showWindow: false, fullscreen: false});
	},
	
	
	render: function(){

		var controls = [];
		if(this.props.handler.hasAudio){
			//controls.push(<i className="fa fa-volume-up stream-controls"></i>);
			if(this.props.handler.muted){
				controls.push(<i className="fa fa-volume-off audio-icon" onClick={this.props.handler.toggleMute.bind(this.props.handler)}></i>);
			} else {
				controls.push(<i className="fa fa-volume-up audio-icon" onClick={this.props.handler.toggleMute.bind(this.props.handler)}></i>);
			}
			
			controls.push(<Slider {...this.props} value={this.props.handler.volume} min={0.0} max={1.0} step={0.05} onChange={this.props.handler.updateVolume.bind(this.props.handler)} />);
			controls.push(<OutputSettings {...this.props}/>);
		}
		
		//controls.push(<i className="fa fa-cog stream-controls" onClick={this.showSettings}></i>);

		/*var settings = [];
		if(this.state.showSettings){
			settings = <OutputSettings {...this.props}/>;
		}*/
		var divStyle = {
			//position: "absolute",
			background: "rgba(0, 0, 0, 0.4)",
			//bottom: "0px",
			width: "100%"
		}
		return <div style={divStyle} className={"audio-controls"}>{controls}</div>
	}
});