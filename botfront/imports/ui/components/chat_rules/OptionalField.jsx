import React from 'react';
import PropTypes from 'prop-types';

import nothing from 'uniforms/nothing';
import ToggleField from '../common/ToggleField';
import DisplayIf from '../DisplayIf';


const OptionalField = (props) => {
    const { name, children } = props;

    const accessProperty = (data, targetName) => {
        let property = data;
        targetName.split('.').forEach((accessor) => { property = property[accessor]; });
        return property;
    };

    const isEnabled = (context, currentName) => {
        try {
            const data = accessProperty(context.model, currentName);
            return data;
        } catch (err) {
            return false;
        }
    };

    const renderChildren = () => children.map(element => ({ ...(element || {}), props: { ...(element.props || {}), name: `${name}.value` } }));
    return (
        <>
            <ToggleField name={`${name}.enabled`} />
            <DisplayIf
                condition={context => isEnabled(context, `${name}.enabled`)}
            >
                {renderChildren()}
            </DisplayIf>
        </>
    ) || nothing;
};

OptionalField.propTypes = {
    name: PropTypes.string.isRequired,
    children: PropTypes.element.isRequired,
};
export default OptionalField;
