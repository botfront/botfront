import React from 'react';
import PropTypes from 'prop-types';

const DashedButton = (props) => {
    const {
        children, color, ...rest
    } = props;
    return (
        <>
            <button
                type='button'
                className={`dashed ${color}`}
                {...rest}
            >
                {children || <>&nbsp;</>}
            </button>
        </>
    );
};

DashedButton.propTypes = {
    color: PropTypes.string.isRequired,
    children: PropTypes.any,
};

DashedButton.defaultProps = {
    children: null,
};

export default DashedButton;
