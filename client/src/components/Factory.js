import React from 'react';
import _ from 'lodash';
import { 
  Badge, Collapse, Fade, 
  Dropdown, DropdownToggle, DropdownMenu,
  DropdownItem, Modal, ModalHeader,
  ModalBody, ModalFooter, Button,
  Form, FormGroup, Input,
  Label, FormFeedback
} from 'reactstrap';

class Factory extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedAmount: 0,
      isChildListOpen: false,
      isDropdownOpen: false,
      isRangeModalOpen: false,
      isNameModalOpen: false,
      isDeleteModalOpen: false,
      factoryFormObject: {},
      formErrors: {}
    }

    this.formErrorMessages = {
      minValue: 'Mimimum cannot be more than maximum',
      factoryName: 'Name must contain only alphanumeric characters',
      maxValue: 'Maximum must be a number'
    };

    this.toggleChildren = this.toggleChildren.bind(this);
    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.renderTally = this.renderTally.bind(this);
    this.makeChildren = this.makeChildren.bind(this);

    this.renderEditModal = this.renderEditModal.bind(this);
    this.toggleEditModal = this.toggleEditModal.bind(this);
    this.renderDeleteModal = this.renderDeleteModal.bind(this);
    this.toggleDeleteModal = this.toggleDeleteModal.bind(this);
    this.updateForm = this.updateForm.bind(this);
    this.deleteFactory = this.deleteFactory.bind(this);
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

    if(e.target.id === 'alsoCreateChildren') {
      formObj[e.target.id] = !formObj[e.target.id];
    } else {
      formObj[e.target.id] = e.target.value;
    }

    if(!formObj['alsoCreateChildren']) {
      delete formObj['numChildren'];
    }

    const formErrors = {
      minValue: !formObj.minValue || !parseInt(formObj.minValue, 10) || parseInt(formObj.minValue, 10) > parseInt(formObj.maxValue, 10),
      maxValue: !formObj.maxValue || !parseInt(formObj.maxValue, 10),
      factoryName: !formObj.factoryName || formObj.factoryName.length < 1 || formObj.factoryName.trim().length < 1
    };

    const userInducedErrors = _.omitBy(formErrors, (v) => !v);

    this.setState({factoryFormObject: formObj, formErrors: userInducedErrors});
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

  deleteFactory() {
    const {
      destroy
    } = this.props;

    const {data: {uuid}} = this.props;
    destroy(uuid);
  }

  toggleDeleteModal() {
    this.setState({isDeleteModalOpen: !this.state.isDeleteModalOpen});
  }

  renderDeleteModal() {
    if(!this.state.isDeleteModalOpen) return (<span />);
    const {
      data: {name}
    } = this.props;

    return (
      <div>
        <Modal isOpen={this.state.isDeleteModalOpen} toggle={this.toggleDeleteModal}>
          <ModalHeader toggle={this.isDeleteModalOpen}>Delete Factory</ModalHeader>
          <ModalBody>
            <Form>
              <FormGroup>
                <Label>Are you sure you want to delete factory {name}?</Label>
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={() => {this.deleteFactory(); this.toggleDeleteModal();}}>
              Yes
            </Button>
            <Button color="secondary" onClick={this.toggleDeleteModal}>No</Button>
          </ModalFooter>
        </Modal>
      </div>
    )
  }

  toggleEditModal() {
    const {
      data: {name, min, max, children}
    } = this.props;

    let initFormObject = {};

    if(!this.state.isEditModalOpen) {
      const oldData = {
        factoryName: name,
        minValue: min,
        maxValue: max,
        numChildren: children.length,
      };

      initFormObject = Object.assign({}, initFormObject, oldData);
    }

    
    this.setState({
      isEditModalOpen: !this.state.isEditModalOpen,
      factoryFormObject: initFormObject,
      formErrors: {}
    });
  }

  renderEditModal() {
    if(!this.state.isEditModalOpen) return (<span />);
    const {factoryFormObject:form, formErrors} = this.state;
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
                  value={form.factoryName} 
                  id="factoryName" 
                  onChange={this.updateForm}
                  invalid={formErrors.factoryName}
                  placeholder="Foo Bar"/>
                <FormFeedback invalid={formErrors.factoryName}>{this.formErrorMessages.factoryName}</FormFeedback>
              </FormGroup>
              <FormGroup inline>
                <Label for="alsoCreateChildren">{data.children.length > 0 ? 'Regenerate Numbers' : 'Generate Numbers'}?</Label>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <Input 
                  type="checkbox" 
                  name="optionalGenerate" 
                  id="alsoCreateChildren" 
                  onChange={this.updateForm}/>
              </FormGroup>
              <Collapse isOpen={[true, 'yes', 'on'].includes(form.alsoCreateChildren)}>
              <FormGroup>
                <Label for="numChildren">Make {form.numChildren || 0} Numbers upon Creation</Label>
                <Input type="range" min="0" max="15" name="amount" id="numChildren" onChange={this.updateForm} />
              </FormGroup>
              </Collapse>
              <FormGroup inline>
                <Label for="minValue">Minimum Value</Label>
                <Input 
                  type="number" 
                  min="0" 
                  id="minValue" 
                  placeholder="0"
                  value={form.minValue}
                  onChange={this.updateForm} 
                  invalid={formErrors.minValue}/>
                <FormFeedback invalid={formErrors.minValue}>{this.formErrorMessages.minValue}</FormFeedback>
              </FormGroup>
              <FormGroup inline>
                <Label for="maxValue">Maximum Value</Label>
                <Input 
                  type="number" 
                  min="1" 
                  id="maxValue" 
                  placeholder="1" 
                  value={form.maxValue}
                  onChange={this.updateForm} 
                  invalid={formErrors.maxValue}/>
                <FormFeedback invalid={formErrors.maxValue}>{this.formErrorMessages.maxValue}</FormFeedback>
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button 
              color="primary" 
              disabled={!_.isEmpty(formErrors)} 
              onClick={e => {this.updateFactory(); this.toggleEditModal();}}>
              Update
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
              {this.renderEditModal()}
              {this.renderDeleteModal()}
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
                  <DropdownItem onClick={this.toggleChildren}>
                    {this.state.isChildListOpen ? 'Hide Children' : 'Show Children'}
                  </DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem onClick={this.toggleEditModal}>Edit</DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem onClick={this.toggleDeleteModal}>Delete</DropdownItem>
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