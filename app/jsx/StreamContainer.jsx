var React = require('react');
var VideoContainer = require('./VideoContainer.jsx');
var StreamControls = require('./StreamControls.jsx');

module.exports = React.createClass({
	getInitialState: function(){
		return {tracks: []};
	},
	componentDidMount: function(){
		// var tracks = this.props.stream.getTracks();
		// this.setState({tracks: tracks});
		
	},
	render: function(){
		var w = Math.floor(this.props.dimensions.w/3);
		var h = w*480/640;
		var divStyle = {
			width: w,
			height: h,
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
			}
			tracks.push(<StreamControls {...this.props} w={w} h={h} />);
		}
		return <div style={divStyle}> {tracks} </div>;
	}
});