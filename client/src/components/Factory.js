import React from 'react';
import { Badge, Collapse, Fade } from 'reactstrap';
//TODO: Integrate reactstrap

class Factory extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			isOpen: false
		}

		this.toggle = this.toggle.bind(this);
		this.renderTally = this.renderTally.bind(this);
	}

	toggle() {
		this.setState({
			isOpen: !this.state.isOpen
		});
	}

	renderTally() {
		const {
			children = []
		} = this.props.data;

		if(children.length < 1 || this.state.isOpen) return (<span />);

		return (
			<Fade in={!this.state.isOpen} className="col">
				<span>
					<Badge color="secondary" pill>{children.length} hidden</Badge>
				</span>
			</Fade>
		);
	}

	render() {
		const {
			children = [],
			name,
			min,
			max,
			uuid
		} = this.props.data;

		return (
			<div>
				<div className="factory-body">
					<div>
						<span className="factory-name" onClick={this.toggle}>
							{name}
						</span>
						&nbsp;&nbsp;&nbsp;
						<span>
							<Badge color="info">{min}:{max}</Badge>
						</span>
						&nbsp;
						&nbsp;&nbsp;&nbsp;
						<span className="factory-menu">
							<span>Button 1</span>
							&nbsp;
							<span>Button 2</span>
						</span>
					</div>
					<Collapse isOpen={this.state.isOpen}>
						<ul className="tree-group children">
						{
							children.map((child, idx) => (
								<li
									key={`child_of_${uuid}_${idx}_${child.number}`}
									className="child">
									{child.number}
								</li>
							))
						}
						</ul>
					</Collapse>
					{this.renderTally()}
				</div>
			</div>
		)
	}
};


export default Factory;