import React from 'react';
import { 
	Badge, Collapse, Fade, 
	Dropdown, DropdownToggle, DropdownMenu,
	DropdownItem, Modal, ModalHeader,
	ModalBody, ModalFooter, Button
} from 'reactstrap';

class Factory extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			selectedAmount: 0,
			isChildListOpen: false,
			isDropdownOpen: false,
			isGenerateModalOpen: false,
			isRangeModalOpen: false,
			isNameModalOpen: false,
			isDeleteModalOpen: false
		}

		this.toggleChildren = this.toggleChildren.bind(this);
		this.toggleDropdown = this.toggleDropdown.bind(this);
		this.renderTally = this.renderTally.bind(this);
		this.makeChildren = this.makeChildren.bind(this);

		this.renderGenModal = this.renderGenModal.bind(this);
		this.toggleGenModal = this.toggleGenModal.bind(this);
		this.renderRangeModal = this.renderRangeModal.bind(this);
		this.toggleRangeModal = this.toggleRangeModal.bind(this);
		this.updateSelectedAmount = this.updateSelectedAmount.bind(this);
	}

	toggleChildren() {
		this.setState({
			isChildListOpen: !this.state.isChildListOpen
		});
	}

	toggleDropdown() {
		this.setState({
			isDropdownOpen: !this.state.isDropdownOpen
		});
	}

	renderTally() {
		const {
			children = []
		} = this.props.data;

		if(children.length < 1 || this.state.isChildListOpen) return (<span />);

		return (
				<span>
					<Badge color="secondary" pill>{children.length} hidden</Badge>
				</span>
		);
	}

	makeChildren() {
		const {
			data: {uuid},
			generate
		} = this.props;

		if(!this.state.selectedAmount) return;

		generate(uuid, this.state.selectedAmount);
	}

	updateSelectedAmount(e) {
		this.setState({selectedAmount: parseInt(e.target.value, 10)});
	}

	toggleGenModal() {
		this.setState({isGenerateModalOpen: !this.state.isGenerateModalOpen});
	}

	renderGenModal() {
		if(!this.state.isGenerateModalOpen) return (<span />);

		return (
			<div>
				<Modal isOpen={this.state.isGenerateModalOpen} toggle={this.toggleGenModal}>
					<ModalHeader toggle={this.toggleRangeModal}>Change Range of Numbers</ModalHeader>
					<ModalBody>
						<input type="range" min="0" max="15" name="amount" onChange={this.updateSelectedAmount} />
						&nbsp;
						<label htmlFor="amount">{this.state.selectedAmount}</label>
					</ModalBody>
					<ModalFooter>
						<Button color="primary" onClick={() => {this.makeChildren(); this.toggleGenModal();}}>
							Generate
						</Button>&nbsp;
						<Button color="secondary" onClick={this.toggleGenModal}>Cancel</Button>
					</ModalFooter>
				</Modal>
			</div>
		)
	}

	toggleRangeModal() {
		this.setState({isRangeModalOpen: !this.state.isRangeModalOpen});
	}

	renderRangeModal() {
		if(!this.state.isRangeModalOpen) return (<span />);

		return (
			<div>
				<Modal isOpen={this.state.isRangeModalOpen} toggle={this.toggleRangeModal}>
					<ModalHeader toggle={this.toggleRangeModal}>Change Range of Numbers</ModalHeader>
					<ModalBody>
						<input type="range" value={`${this.state.selectedAmount}`} min="0" max="15" name="amount" onChange={this.updateSelectedAmount} />
						<label htmlFor="amount">{this.state.selectedAmount}</label>
					</ModalBody>
					<ModalFooter>
						<Button color="primary" onClick={() => {this.makeChildren(); this.toggleRangeModal();}}>
							Generate
						</Button>&nbsp;
						<Button color="secondary" onClick={this.toggleRangeModal}>Cancel</Button>
					</ModalFooter>
				</Modal>
			</div>
		)
	}

	render() {
		const {
			data: {
				children = [], name, min,
				max, uuid
			},
			generate
		} = this.props;

		return (
			<div>
				<div className="factory-body">
					<div>
						<span className="factory-name">
							{this.renderGenModal()}
							<Dropdown className="factory-name" isOpen={this.state.isDropdownOpen} toggle={this.toggleDropdown}>
								<DropdownToggle caret>
									{name}
								</DropdownToggle>
								&nbsp;&nbsp;&nbsp;
								<span>
									<Badge color="info">{min}:{max}</Badge>
								</span>
								&nbsp;
								{this.renderTally()}
								<DropdownMenu>
									<DropdownItem onClick={this.toggleGenModal}>{children.length < 1 ? 'Generate' : 'Regenerate'}</DropdownItem>
									<DropdownItem onClick={this.toggleChildren}>
										{this.state.isChildListOpen ? 'Hide Children' : 'Show Children'}
									</DropdownItem>
									<DropdownItem divider />
									<DropdownItem>Change Name</DropdownItem>
									<DropdownItem onClick={this.toggleRangeModal}>Adjust Number Range</DropdownItem>
									<DropdownItem divider />
									<DropdownItem>Delete</DropdownItem>
								</DropdownMenu>
							</Dropdown>
						</span>
					</div>
					<Collapse isOpen={this.state.isChildListOpen}>
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
				</div>
			</div>
		)
	}
};


export default Factory;