var React = require('react');
var ButtonInput = require('./ButtonInput.jsx');
var AddStream = require('./AddStream.jsx');

module.exports = React.createClass({
	getInitialState: function(){
		return {addStream: false}
	},
	toggleAddStream: function(){
		this.setState({addStream: this.state.addStream? false: true});
	},
	render: function(){
		var menus = [];
		if (this.state.addStream){
			menus.push(<AddStream {...this.props} closeMenu={this.toggleAddStream}/>);
		}
		var overlayStyle = {
			position: "fixed",
			width: "100%",
			height: "100%",
			top: "0px",
			left: "0px",
			pointerEvents: "none"
		};

	
		return <div style={overlayStyle}>
			{menus}
			<div className="toolbar">
				{this.props.liveLab.room}
				<ButtonInput text="+ Add Stream" className="toolbar-button" onClick={this.toggleAddStream}/>
			</div>
			</div>;
	}
});