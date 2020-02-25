import React from 'react';
import PropTypes from 'prop-types';

const Linker = React.forwardRef(({ children, ...rest }, ref) => (
    <span
        className='linker-link'
        {...rest}
        {...(ref ? { ref } : {})}
    >
        {children}
    </span>
));

Linker.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.string,
        PropTypes.array,
    ]).isRequired,
};

Linker.defaultProps = {
};

export default Linker;
