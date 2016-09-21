var React = require('react');

module.exports = React.createClass({
	shouldComponentUpdate: function(){
		return false;
	},
	render: function(){
	
		
		return <video autoPlay muted={this.props.muted} width={this.props.w} height={this.props.h} ref="vid" src={window.URL.createObjectURL(this.props.stream)} />
	}
});