import React from 'react';
import PropTypes from 'prop-types';

import nothing from 'uniforms/nothing';
import ToggleField from '../common/ToggleField';
import DisplayIf from '../DisplayIf';

import { getModelField } from '../../../lib/autoForm.utils';

const OptionalField = (props) => {
    const {
        name, children, label, 'data-cy': dataCy, getError, showToggle,
    } = props;

    const isEnabled = (context, currentName) => {
        try {
            const data = getModelField(currentName, context.model);
            return data;
        } catch (err) {
            return false;
        }
    };

    const renderChildren = () => children.map(element => ({
        ...(element || {}),
        props: {
            ...(element.props || {}),
            name: element.props.name ? `${name}.${element.props.name}` : name,
            error: getError(
                element.props.name ? `${name}.${element.props.name}` : name,
            ),
        },
    }));
    return (
        (
            <>
                {showToggle && (
                    <ToggleField
                        name={`${name}__DISPLAYIF`}
                        {...(label ? { label } : {})}
                        {...(dataCy ? { 'data-cy': dataCy } : {})}
                    />
                )}
                <DisplayIf
                    condition={context => isEnabled(context, `${name}__DISPLAYIF`)}
                >
                    <>{children ? renderChildren() : nothing}</>
                </DisplayIf>
            </>
        ) || nothing
    );
};

OptionalField.propTypes = {
    name: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.element).isRequired,
        PropTypes.element,
    ]),
    label: PropTypes.string,
    'data-cy': PropTypes.string,
    getError: PropTypes.func,
    showToggle: PropTypes.bool,
};
OptionalField.defaultProps = {
    label: null,
    'data-cy': null,
    getError: () => false,
    showToggle: true,
};

export default OptionalField;
