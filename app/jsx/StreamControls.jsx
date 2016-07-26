var React = require('react');
var ReactDOM = require('react-dom');
var VideoContainer = require('./VideoContainer.jsx');

module.exports = React.createClass({
	getInitialState: function(){
		return({showSettings: false, showWindow: false});
	},
	showSettings: function(){
		this.setState({showSettings: this.state.showSettings ? false : true})
	},
	showWindow: function(){
		//var otherWindow = window.open("show", 'popup');
		//opening separate windows in react http://blog.persistent.info/2016/01/multiple-windows-in-hybrid-react.html
		 var ip = window.location.host + window.location.pathname;
		var peerWindow = window.open(null, "new window", 'popup');
		var container = peerWindow.document.createElement("div");
		console.log(peerWindow.document.body);
		peerWindow.document.body.appendChild(container);
		ReactDOM.render(<VideoContainer stream={this.props.handler.stream} muted={true} />, container);
		this.setState({showWindow: true});
//ReactDOM.render(<parts.PanelContents .../>, container);
	},
	render: function(){

		var controls = [];
		if(this.props.handler.hasAudio){
			//controls.push(<i className="fa fa-volume-up stream-controls"></i>);
			if(this.props.handler.muted){
				controls.push(<i className="fa fa-microphone-slash stream-controls" onClick={this.props.handler.toggleMute.bind(this.props.handler)}></i>);
			} else {
				controls.push(<i className="fa fa-microphone stream-controls" onClick={this.props.handler.toggleMute.bind(this.props.handler)}></i>);
			}
		}
		if(this.props.handler.hasVideo){
			controls.push(<i className="fa fa-clone stream-controls" onClick={this.showWindow}></i>);
		}
		controls.push(<i className="fa fa-cog stream-controls" onClick={this.showSettings}></i>);

		var settings = [];
		if(this.state.showSettings){
			settings = <div> SETTINGS </div>;
		}
		var divStyle = {
			position: "absolute",
			background: "rgba(0, 0, 0, 0.4)",
			bottom: "0px",
			width: "100%",
			textAlign: "right"
		}
		return <div style={divStyle}>{controls}{settings}</div>
	}
});