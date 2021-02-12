import React from 'react';
import PropTypes from 'prop-types';
import SlotPopupContent from './common/SlotPopupContent';

export const slotValueToLabel = value => (
    value === null
        ? 'null'
        : Array.isArray(value) && !value.length
            ? 'empty'
            : value.toString()
);

export default function SlotLabel({ value, onChange, disableSelection, excludeSlotsOfType }) {
    const [name] = Object.keys(value);
    const slotValue = value[name];

    const renderLabel = () => (
        <div className='label-container orange'>
            <div>
                slot
            </div>
            <div>
                {name}:&nbsp; <span className='slot-content'>{slotValueToLabel(slotValue)}</span>
            </div>
        </div>
    );
    return disableSelection ? renderLabel() : (
        <SlotPopupContent
            trigger={renderLabel()}
            onSelect={slot => onChange(slot)}
            value={value}
            disabled={disableSelection}
            excludeSlotsOfType={excludeSlotsOfType}
        />
    );
}

SlotLabel.propTypes = {
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    disableSelection: PropTypes.bool,
    excludeSlotsOfType: PropTypes.array,
};

SlotLabel.defaultProps = {
    disableSelection: false,
    excludeSlotsOfType: ['unfeaturized'],
};
