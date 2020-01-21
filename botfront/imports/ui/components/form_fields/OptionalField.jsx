import React from 'react';
import PropTypes from 'prop-types';

import nothing from 'uniforms/nothing';
import ToggleField from '../common/ToggleField';
import DisplayIf from '../DisplayIf';

import { getModelField } from '../../../lib/autoForm.utils';


const OptionalField = (props) => {
    const {
        name, children, label, 'data-cy': dataCy,
    } = props;

    const isEnabled = (context, currentName) => {
        try {
            const data = getModelField(currentName, context.model);
            return data;
        } catch (err) {
            return false;
        }
    };

    const renderChildren = () => children.map(element => ({ ...(element || {}), props: { ...(element.props || {}), name: (element.props.name ? `${name}.${element.props.name}` : name) } }));
    return (
        <>
            <ToggleField name={`${name}__DISPLAYIF`} {...label ? { label } : {}} {...dataCy ? { 'data-cy': dataCy } : {}} />
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
    children: PropTypes.oneOfType(PropTypes.arrayOf(PropTypes.element).isRequired, PropTypes.element),
    label: PropTypes.string,
    'data-cy': PropTypes.string,
};
OptionalField.defaultProps = {
    label: null,
    'data-cy': null,
};

export default OptionalField;
