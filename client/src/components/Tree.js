import React from 'react';
import Factory from 'components/Factory';
import TreeContainer from 'containers/TreeContainer';

class TreeComponent extends React.Component {

	componentDidMount() {
		const {connect} = this.props;
		connect('ws://localhost:3000/live/connect');
	}
	render() {
		return (
			<div>
				<Factory foo={'bar'} />
				WIP
				{
					//For each factory -> <Factory {factoryObj} />
				}
			</div>);
	}
}

export default TreeContainer(TreeComponent);