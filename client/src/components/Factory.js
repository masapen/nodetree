import React from 'react';

const Factory = props => {
	const {
		children = [],
		name,
		min,
		max
	} = props.data;

	return (
		<div>
			<div className="factory-info">
			{name} - {min}:{max}
			{
				children.map(child => (<p>    {child.number}</p>))
			}
			</div>
		</div>
	)
};


export default Factory;