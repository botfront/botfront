import React from 'react';
import PropTypes from 'prop-types';

import nothing from 'uniforms/nothing';
import ToggleField from '../common/ToggleField';
import DisplayIf from '../DisplayIf';


const OptionalField = (props) => {
    const { name, children, label } = props;

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

    const renderChildren = () => children.map(element => ({ ...(element || {}), props: { ...(element.props || {}), name: (element.props.name ? `${name}.${element.props.name}` : name) } }));
    return (
        <>
            <ToggleField name={`${name}__DISPLAYIF`} {...label ? { label } : {}} />
            <DisplayIf
                condition={context => isEnabled(context, `${name}__DISPLAYIF`)}
            >
                <>
                    {children ? renderChildren() : nothing}
                </>
            </DisplayIf>
        </>
    ) || nothing;
};

OptionalField.propTypes = {
    name: PropTypes.string.isRequired,
    children: PropTypes.element.isRequired,
    label: PropTypes.string,
};
OptionalField.defaultProps = {
    label: null,
};

export default OptionalField;
