import React from 'react';
import { 
	Badge, Collapse, Fade, 
	Dropdown, DropdownToggle, DropdownMenu,
	DropdownItem, Modal, ModalHeader,
	ModalBody, ModalFooter, Button,
	Form, FormGroup, Input,
	Label
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
			isDeleteModalOpen: false,
			factoryFormObject: {
				alsoCreateChildren: false
			}
		}

		this.toggleChildren = this.toggleChildren.bind(this);
		this.toggleDropdown = this.toggleDropdown.bind(this);
		this.renderTally = this.renderTally.bind(this);
		this.makeChildren = this.makeChildren.bind(this);

		this.renderGenModal = this.renderGenModal.bind(this);
		this.toggleGenModal = this.toggleGenModal.bind(this);
		this.renderEditModal = this.renderEditModal.bind(this);
		this.toggleEditModal = this.toggleEditModal.bind(this);
		this.updateForm = this.updateForm.bind(this);
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

	updateForm(e) {
		const formObj = this.state.factoryFormObject;

		//Reactstrap's checkbox returning "on" no matter the state is troublesome.
		if(e.target.id === 'alsoCreateChildren') {
			formObj[e.target.id] = !formObj[e.target.id];
		} else {
			formObj[e.target.id] = e.target.value;
		}

		if(!formObj['alsoCreateChildren']) {
			delete formObj['numChildren'];
		}

		console.log(formObj);
		this.setState({factoryFormObject: formObj});
	}

	updateFactory() {
		const {
			factoryFormObject
		} = this.state;

		const {
			data: {uuid, name, min, max},
			update
		} = this.props;

		const oldInfo = {
			factoryName: name,
			minValue: min,
			maxValue: max
		};

		const submission = Object.assign({}, oldInfo, factoryFormObject);
		update(uuid, submission);
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

	toggleEditModal() {
		const {
			data: {name, min, max}
		} = this.props;

		let initFormObject = {
			alsoCreateChildren: false
		};

		if(!this.state.isEditModalOpen) {
			const oldData = {
				factoryName: name,
				minValue: min,
				maxValue: max
			};

			initFormObject = Object.assign({}, initFormObject, oldData);
		}

		this.setState({
			isEditModalOpen: !this.state.isEditModalOpen,
			factoryFormObject: initFormObject
		});
	}

	renderEditModal() {
		if(!this.state.isEditModalOpen) return (<span />);
		const {factoryFormObject} = this.state;
		const {
			data
		} = this.props;
		return (
			<div>
				<Modal isOpen={this.state.isEditModalOpen} toggle={this.toggleEditModal}>
					<ModalHeader toggle={this.toggleEditModal}>Edit Factory</ModalHeader>
					<ModalBody>
						<Form>
							<FormGroup>
								<Label for="factoryName">Name</Label>
								<Input 
									type="text" 
									name="newFactoryName" 
									value={factoryFormObject.factoryName} 
									id="factoryName" 
									onChange={this.updateForm} 
									placeholder="Foo Bar" />
							</FormGroup>
							<FormGroup inline>
								<Label for="alsoCreateChildren">Regenerate Numbers?</Label>
								&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								<Input type="checkbox" name="optionalGenerate" id="alsoCreateChildren" onChange={this.updateForm} />
							</FormGroup>
							<Fade in={[true, 'yes', 'on'].includes(this.state.factoryFormObject.alsoCreateChildren)}>
							<FormGroup>
								<Label for="numChildren">Make {factoryFormObject.numChildren || 0} Numbers upon Creation</Label>
								<Input type="range" min="0" max="15" name="amount" id="numChildren" onChange={this.updateForm} />
							</FormGroup>
							</Fade>
							<FormGroup inline>
								<Label for="minValue">Minimum Value</Label>
								<Input 
									type="number" 
									min="0" 
									id="minValue" 
									placeholder="0" 
									onChange={this.updateForm} />
							</FormGroup>
							<FormGroup inline>
								<Label for="maxValue">Maximum Value</Label>
								<Input 
									type="number" 
									min="1" 
									id="maxValue" 
									placeholder="1" 
									onChange={this.updateForm} />
							</FormGroup>
						</Form>
					</ModalBody>
					<ModalFooter>
						<Button color="primary" onClick={e => {this.updateFactory(); this.toggleEditModal(e);}}>
							Create
						</Button>&nbsp;
						<Button color="secondary" onClick={this.toggleEditModal}>Cancel</Button>
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
							{this.renderEditModal()}
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
									<DropdownItem onClick={this.toggleEditModal}>Edit</DropdownItem>
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