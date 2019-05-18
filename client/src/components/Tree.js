import React from 'react';
import _ from 'lodash';
import Factory from 'components/Factory';
import TreeContainer from 'containers/TreeContainer';
import config from 'lib/config';
import { 
  Button, Modal, ModalHeader,
  ModalBody, ModalFooter, Form,
  FormGroup, Input, Label, FormFeedback 
} from 'reactstrap';

class TreeComponent extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isFactoryModalOpen: false,
      selectedAmount: 0,
      factoryFormObject: {},
      formErrors: {},
      emptyForm: false
    };

    this.formErrorMessages = {
      minValue: 'Mimimum cannot be more than maximum',
      factoryName: 'Name must contain only alphanumeric characters',
      maxValue: 'Maximum must be a number'
    };

    this.renderFactoryModal = this.renderFactoryModal.bind(this);
    this.toggleFactoryModal = this.toggleFactoryModal.bind(this);
    this.updateForm = this.updateForm.bind(this);
    this.createFactory = this.createFactory.bind(this);
  }

  componentDidMount() {
    const {connect} = this.props;
    connect(config.server);
  }

  updateForm(e) {
    const formObj = this.state.factoryFormObject;
    formObj[e.target.id] = e.target.value;

    const formErrors = {
      minValue: !formObj.minValue || !parseInt(formObj.minValue, 10) || parseInt(formObj.minValue, 10) > parseInt(formObj.maxValue, 10),
      maxValue: !formObj.maxValue || !parseInt(formObj.maxValue, 10),
      factoryName: !formObj.factoryName || formObj.factoryName.length < 1 || 
        formObj.factoryName.trim().length < 1 || !RegExp(/^\w+$/, 'g').test(formObj.factoryName)
    };

    const userInducedErrors = _.omitBy(formErrors, (v) => !v);

    this.setState({
      factoryFormObject: formObj, 
      formErrors: userInducedErrors,
      emptyForm: false
    });
  }

  createFactory() {
    const {create} = this.props;
    create(this.state.factoryFormObject);
    this.setState({factoryFormObject: {}});
  }

  toggleFactoryModal(e) {

    this.setState({emptyForm: true, isFactoryModalOpen: !this.state.isFactoryModalOpen});
  }

  renderFactoryModal() {
    if(!this.state.isFactoryModalOpen) return (<span />);
    const {
      factoryFormObject:form, 
      formErrors, 
      emptyForm
    } = this.state;

    const {
      data
    } = this.props;

    return (
      <div>
        <Modal isOpen={this.state.isFactoryModalOpen} toggle={this.toggleFactoryModal}>
          <ModalHeader toggle={this.toggleFactoryModal}>Create New Factory</ModalHeader>
          <ModalBody>
            <Form>
              <FormGroup>
                <Label for="factoryName">Name</Label>
                <Input 
                  type="text" 
                  name="newFactoryName" 
                  id="factoryName" 
                  onChange={this.updateForm} 
                  invalid={formErrors.factoryName}
                  placeholder="Foo Bar" />
                <FormFeedback invalid={formErrors.factoryName}>{this.formErrorMessages.factoryName}</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="numChildren">Make {form.numChildren || 0} Numbers upon Creation</Label>
                <Input type="range" min="0" max="15" name="amount" id="numChildren" onChange={this.updateForm} />
              </FormGroup>
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
                <Input type="number" min="1" id="maxValue" placeholder="1" onChange={this.updateForm} />
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button 
              color="primary" 
              disabled={!_.isEmpty(formErrors) || emptyForm}
              onClick={e => {this.createFactory(); this.toggleFactoryModal(e);}}>
              Create
            </Button>&nbsp;
            <Button color="secondary" onClick={this.toggleFactoryModal}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </div>
    )
  }

  render() {
    const {
      tree = []
    } = this.props;

    return (
      <div className="tree">
        {this.renderFactoryModal()}
        <Button color="primary" onClick={this.toggleFactoryModal}>New Factory +</Button>
        <ul className="tree-group factory">
        {
          tree.map((factory, idx) => (
            <li key={`factory_${idx}`}>
              <Factory 
                data={factory} 
                generate={this.props.generateChildren} 
                update={this.props.update}
                destroy={this.props.destroy} />
            </li>))
        }
        </ul>
      </div>
    );
  }
}

export default TreeContainer(TreeComponent);