var React = require('react');
var ButtonInput = require('./ButtonInput.jsx');
var Dropdown = require('./Dropdown.jsx');
/* Select input source reference: https://github.com/webrtc/samples/blob/gh-pages/src/content/devices/input-output/js/main.js */
module.exports = React.createClass({
	getInitialState: function(){
		return {step: 0, constraints: {video: false, audio: false}, data: false};
	},
	updateStep: function(){
		this.setState({step: this.state.step + 1});
	},
	newStream: function(){
		if(this.state.constraints.audio!= false || this.state.constraints.video!= false){
			this.props.liveLab.newStream(this.state.constraints);
		}
		
		if(this.state.data==true){
			this.props.liveLab.newDataChannel({port: 4002, name: "boo"});
		}
		this.props.closeMenu();
	},
	changeCheckbox: function(param){
		//this.state.constraints[param]? false: true
		var newConstraints = this.state.constraints;
		newConstraints[param] = this.state.constraints[param]? false: true;
		this.setState({constraints: newConstraints});
	},
	changeData: function(param){
		this.setState({data: true});
	},
	onSelectAudioSource: function(e){
		var newConstraints = this.state.constraints;
		newConstraints.audio = {deviceId: {exact: e.target.value}};
		this.setState({constraints: newConstraints});
	},
	onSelectVideoSource: function(e){
		var newConstraints = this.state.constraints;
		newConstraints.video = {deviceId: {exact: e.target.value}};
		this.setState({constraints: newConstraints});
	},
	getDropdown: function(type){
		var deviceId = this.state.constraints[type].deviceId;
		if(type=="audio"){
			var opts = this.props.liveLab.devices.audioinput.map(function(dev){
				return {label: dev.label, value: dev.deviceId};
			});
			return <Dropdown {...this.props} label="Select input:  " value={deviceId ? deviceId.exact: 0} options={opts} onChange={this.onSelectAudioSource}/>;
		} else {
			var opts = this.props.liveLab.devices.videoinput.map(function(dev){
				return {label: dev.label, value: dev.deviceId};
			});
			return <Dropdown {...this.props} label="Select input:  " value={deviceId ? deviceId.exact: 0} options={opts} onChange={this.onSelectVideoSource}/>;
		}
	},
	render: function(){
		var formContents = [];
		if(this.state.step==0){
			var obj = this.state.constraints;
		//	console.log(obj);
			for(var param in obj){
				if(obj[param]!=false){
					var opts = this.getDropdown(param);	
					formContents.push(<div>
									<input type="checkbox" name={" "+ param} checked={true} onChange={this.changeCheckbox.bind(this, param)}/>
									{param}
									{opts}
								</div>);	
				} else {
					formContents.push(<div>
										<input type="checkbox" name={" "+ param} checked={this.state.constraints[param]} onChange={this.changeCheckbox.bind(this, param)}/>
										{param}
									</div>);
				}
			}

			formContents.push(<div>
										<input type="checkbox" name={"data"} checked={this.state.data} onChange={this.changeData}/>
										{"data"}
									</div>);
			//	formContents.push(<input type="checkbox" name="vehicle" value="Car" checked> I have a car/>);
		}
		
		return (<div className="right-menu"> 
			<div>Add stream: </div>
			{formContents}
			<ButtonInput text="Add!" className="" onClick={this.newStream}/>
		</div>);
	
	}
});