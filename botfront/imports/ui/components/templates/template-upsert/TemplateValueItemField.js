import React, { Children } from 'react';
import connectField from 'uniforms/connectField';
import joinName from 'uniforms/joinName';

import { AutoField } from 'uniforms-semantic';

const TemplateValueItemField = props => (
    <div className='item'>

        <div className='middle aligned content' style={{ width: '100%' }}>
            {props.children ? (
                Children.map(props.children, child => React.cloneElement(child, {
                    name: joinName(props.name, child.props.name),
                    label: null,
                    style: {
                        margin: 0,
                        ...child.props.style,
                    },
                }))
            ) : (
                <AutoField {...props} style={{ margin: 0 }} />
            )}
        </div>
    </div>
);

export default connectField(TemplateValueItemField, { includeInChain: false, includeParent: true });
