var React = require('react');

module.exports = React.createClass({
	
	render: function(){
		
	
		
		return <video autoPlay muted={this.props.muted} width="100%" ref="vid" src={window.URL.createObjectURL(this.props.stream)} />
	}
});