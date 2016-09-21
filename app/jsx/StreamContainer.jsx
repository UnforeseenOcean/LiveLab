var React = require('react');
var VideoContainer = require('./VideoContainer.jsx');
var AudioContainer = require('./AudioContainer.jsx');
var StreamControls = require('./StreamControls.jsx');

module.exports = React.createClass({
	getInitialState: function(){
		return {showControls: false};
	},
	componentDidMount: function(){
		// var tracks = this.props.stream.getTracks();
		// this.setState({tracks: tracks});
		
	},
	showControls: function(){
		console.log("MOUSE");
	},

	render: function(){
		var w = this.props.w;
		var h = w*480/640;
		var divStyle = {
			//width: w,
			//height: h,
			position: "relative", 
			display: "inline-block"
		}
		var tracks = [];
		if(this.props.handler){
			// if(this.props.handler.hasAudio){
			// 	tracks.push(<AudioContainer {...this.props} w={w} h={h} />);
			// }
			if(this.props.handler.hasVideo){
				tracks.push(<VideoContainer {...this.props} w={w} h={h} />);
				tracks.push(<StreamControls {...this.props} w={w} h={h} />);
			} else {
				tracks.push(<AudioContainer {...this.props} w={w} h={h} />);
			}
		/*	if(this.props.handler.hasAudio){
				tracks.push(<AudioContainer {...this.props} w={w} h={h} />);
			}*/
			
		}
		return <div onMouseOver={this.showControls} style={divStyle}> {tracks} </div>;
	}
});