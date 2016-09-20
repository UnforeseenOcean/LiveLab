var React = require('react');


module.exports = React.createClass({

	render: function(){
		var list = this.props.options.map(function(obj){
			return <option value={obj.value}>{obj.label}</option>;
		});
		var select = <select onChange={this.props.onChange} value={this.props.value}> {list} </select>;
		return <div>{this.props.label}{select}</div>
	}
});