import React from 'react';
import PropTypes from 'prop-types';
import SlotPopupContent from './common/SlotPopupContent';
import ExceptionWrapper from './common/ExceptionWrapper';

export default function SlotLabel({ value, onChange, size }) {
    const { type, name, slotValue, hasError, hasWarning } = value;
    return (
        <SlotPopupContent
            trigger={(
                <div className='label-container slot'>
                    <div className={`${size}-label-text label-context slot`}>
                        {type}
                    </div>
                    <div className={`${size}-label-value label-context slot`}>
                        {name}:&nbsp; <span className='slot-content'>{slotValue.toString()}</span>
                    </div>
                </div>
            )}
            onSelect={slot => onChange(slot)}
            value={value}
        />
    );
}

SlotLabel.propTypes = {
    value: PropTypes.object.isRequired,
    size: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    hasError: PropTypes.bool,
    hasWarning: PropTypes.bool,
};

SlotLabel.defaultProps = {
    size: 'mini',
    hasError: false,
    hasWarning: false,
};
