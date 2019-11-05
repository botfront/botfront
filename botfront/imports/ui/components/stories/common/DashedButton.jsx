import React from 'react';
import PropTypes from 'prop-types';

const DashedButton = (props) => {
    const {
        children, color, size, ...rest
    } = props;
    return (
        <>
            <button
                type='button'
                className={`dashed ${color} ${size}`}
                {...rest}
            >
                {children || <>&nbsp;</>}
            </button>
        </>
    );
};

DashedButton.propTypes = {
    color: PropTypes.string.isRequired,
    size: PropTypes.string,
    children: PropTypes.any,
};

DashedButton.defaultProps = {
    children: null,
    size: 'small',
};

export default DashedButton;
