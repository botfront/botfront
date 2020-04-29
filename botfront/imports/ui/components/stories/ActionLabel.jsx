import React from 'react';
import PropTypes from 'prop-types';
import ActionPopupContent from './common/ActionPopupContent';

export default function ActionLabel({ value, onChange }) {
    return (
        <ActionPopupContent
            trigger={(
                <div className='label-container pink'>
                    <div>
                        action
                    </div>
                    <div>
                        {value}
                    </div>
                </div>
            )}
            initialValue={value}
            onSelect={action => onChange(action)}
        />
    );
}


ActionLabel.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};
