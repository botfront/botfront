import React from 'react';
import PropTypes from 'prop-types';
import ActionPopupContent from './common/ActionPopupContent';
import ExceptionWrapper from './common/ExceptionWrapper';

export default function ActionLable({ value, onChange, size }) {
    return (
        <ActionPopupContent
            trigger={(
                <div className='label-container action'>
                    <div className={`${size}-label-text label-context action`}>
                        action
                    </div>
                    <div className={`${size}-label-value label-context action`}>
                        {value}
                    </div>
                </div>
            )}
            onSelect={action => onChange(action)}
        />
    );
}


ActionLable.propTypes = {
    value: PropTypes.string.isRequired,
    size: PropTypes.string,
    onChange: PropTypes.func.isRequired,
};

ActionLable.defaultProps = {
    size: 'mini',
};
