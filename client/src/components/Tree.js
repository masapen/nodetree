import React from 'react';
import Factory from 'components/Factory';
import TreeContainer from 'containers/TreeContainer';
import config from 'lib/config';
import { Button } from 'reactstrap';

class TreeComponent extends React.Component {

	componentDidMount() {
		const {connect} = this.props;
		connect(config.server);
	}

	render() {
		const {
			tree = []
		} = this.props;

		return (
			<div className="tree">
				<Button color="primary">New Factory +</Button>
				<ul className="tree-group factory">
				{
					tree.map((factory, idx) => (<li key={`factory_${idx}`}><Factory data={factory} /></li>))
				}
				</ul>
			</div>
		);
	}
}

export default TreeContainer(TreeComponent);