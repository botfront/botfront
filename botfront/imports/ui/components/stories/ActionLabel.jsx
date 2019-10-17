import React from 'react';
import PropTypes from 'prop-types';
import ActionPopupContent from './common/ActionPopupContent';

export default function ActionLable({ value, onChange }) {
    return (
        <ActionPopupContent
            trigger={(
                <div className='label-container orange'>
                    <div>
                        action
                    </div>
                    <div>
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
    onChange: PropTypes.func.isRequired,
};
