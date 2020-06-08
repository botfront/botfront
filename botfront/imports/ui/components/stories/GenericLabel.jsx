import React from 'react';
import PropTypes from 'prop-types';

export default function GenericLabel({ color, label, value }) {
    return (
        <div className={`label-container ${color}`}>
            <div>
                { label }
            </div>
            {value && <div>{value}</div>}
        </div>
    );
}


GenericLabel.propTypes = {
    color: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
};

GenericLabel.defaultProps = {
    value: null,
};
