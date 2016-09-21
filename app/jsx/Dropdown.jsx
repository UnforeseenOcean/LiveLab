var React = require('react');


module.exports = React.createClass({

	render: function(){
		var list = this.props.options.map(function(obj){
			return <option value={obj.value}>{obj.label}</option>;
		});
		list.unshift( <option disabled value={0}> -- {this.props.label} -- </option>);
		var select = <select onChange={this.props.onChange} value={this.props.value}> {list} </select>;
		return <div style={{display: "inline", marginLeft: "2px", marginRight: "2px"}}>{select}</div>
	}
});