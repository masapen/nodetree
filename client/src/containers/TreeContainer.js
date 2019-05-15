/*
	TODO: Pull in all of the methods!!!!
	Tree object structure goes to map state to props,
	methods to map dispatch to props

	NOTE: Also needs to be updated via websocket?
	TODO: Merge WebsocketContainer features into TreeContainer
*/

import {connect} from 'react-redux';
import {connectToHost} from 'reducers/tree';

const mapStateToProps = state => ({...state});

const mapDispatchToProps = {
	connect: connectToHost
}

export default connect(mapStateToProps, mapDispatchToProps);