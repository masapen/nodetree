import React from 'react';

const Factory = props => {
	return (
		<div>
		{JSON.stringify(props, null, 2)}
		</div>
	)
};


export default Factory;