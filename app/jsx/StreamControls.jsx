var React = require('react');
var ReactDOM = require('react-dom');
var VideoContainer = require('./VideoContainer.jsx');

module.exports = React.createClass({
	getInitialState: function(){
		return({showSettings: false, showWindow: false, fullscreen: false});
	},
	showSettings: function(){
		this.setState({showSettings: this.state.showSettings ? false : true})
	},
	toggleFullscreen: function(){
		var isFirefox = typeof InstallTrigger !== 'undefined';
		 var isChrome = !!window.chrome && !!window.chrome.webstore;
		if(this.state.fullscreen){

		} else {
			 if (isFirefox == true) {
                this.childWindow.document.getElementsByTagName('video')[0].mozRequestFullScreen();
            }
            if (isChrome == true) {
                this.childWindow.document.getElementsByTagName('video')[0].webkitRequestFullScreen();
            }
            this.setState({fullscreen: true});
		}
	},
	showWindow: function(){
		var peerWindow = window.open(null, "new window", 'popup');
		var isFirefox = typeof InstallTrigger !== 'undefined';
		 var isChrome = !!window.chrome && !!window.chrome.webstore;
		if(isChrome){
			var container = peerWindow.document.createElement("div");
			peerWindow.document.body.appendChild(container);
			ReactDOM.render(<VideoContainer stream={this.props.handler.stream} fullscreen={this.state.fullscreen} muted={true} />, container);
		}
		if(isFirefox){
			peerWindow.onload = function() {
				var container = peerWindow.document.createElement("div");
				peerWindow.document.body.appendChild(container);
				ReactDOM.render(<VideoContainer stream={this.props.handler.stream} fullscreen={this.state.fullscreen} muted={true} />, container);
			}.bind(this);
		}
		/* Detect when window is closed by user */
		peerWindow.onbeforeunload = function(){ 
			console.log("closing window");
			this.setState({showWindow: false, fullscreen: false});
		 }.bind(this);
		this.childWindow = peerWindow;
		this.setState({showWindow: true}); 
	},
	render: function(){

		var controls = [];
		if(this.props.handler.hasAudio){
			//controls.push(<i className="fa fa-volume-up stream-controls"></i>);
			if(this.props.handler.muted){
				controls.push(<i className="fa fa-volume-off stream-controls" onClick={this.props.handler.toggleMute.bind(this.props.handler)}></i>);
			} else {
				controls.push(<i className="fa fa-volume-up stream-controls" onClick={this.props.handler.toggleMute.bind(this.props.handler)}></i>);
			}
		}
		if(this.props.handler.hasVideo){
			if(!this.state.showWindow){
				controls.push(<i className="fa fa-clone stream-controls" onClick={this.showWindow}></i>);
			} else {
				controls.push(<i className="fa fa-clone stream-controls selected" onClick={this.showWindow}></i>);
				controls.push(<i className="fa fa-expand stream-controls" onClick={this.toggleFullscreen}></i>);
			}
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