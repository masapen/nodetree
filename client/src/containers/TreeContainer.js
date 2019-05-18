import {connect} from 'react-redux';
import {
  connectToHost, generateChildren, createFactory,
  updateFactory, deleteFactory
} from 'reducers/tree';

const mapStateToProps = state => ({...state});

const mapDispatchToProps = {
  connect: connectToHost,
  generateChildren,
  create: createFactory,
  update: updateFactory,
  destroy: deleteFactory
}

export default connect(mapStateToProps, mapDispatchToProps);