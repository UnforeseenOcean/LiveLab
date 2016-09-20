var React = require('react');


module.exports = React.createClass({

	render: function(){
		
		return <button onClick={this.props.onClick} className={this.props.className}>{this.props.text}   </button>
	}
});