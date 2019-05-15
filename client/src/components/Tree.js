import React from 'react';
import Factory from 'components/Factory';
import TreeContainer from 'containers/TreeContainer';

class TreeComponent extends React.Component {

	componentDidMount() {
		const {connect} = this.props;
		connect('ws://localhost:3000/live/connect');
	}
	render() {
		const {
			tree = []
		} = this.props;

		return (
			<div>
			{
				tree.map(factory => (<Factory data={factory} />))
			}
			</div>
		);
	}
}

export default TreeContainer(TreeComponent);