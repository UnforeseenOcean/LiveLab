var React = require('react');


module.exports = React.createClass({

	render: function(){
		//console.log("RANGe", this.props.value);
		return <input type="range" id="myRange" value={this.props.value} min={this.props.min} step={this.props.step} max={this.props.max} onChange={this.props.onChange}/>
	}
});