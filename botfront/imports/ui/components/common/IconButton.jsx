import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';

const IconButton = React.forwardRef((props, ref) => {
    const {
        onClick, onMouseDown, icon, size, color, 'data-cy': dataCy, disabled, basic, id, className, active,
    } = props;

    return (
        <Button
            ref={ref}
            size={size}
            onClick={onClick}
            onMouseDown={onMouseDown}
            color={color}
            icon={icon}
            className={`icon-button ${color} ${className}`}
            data-cy={typeof dataCy === 'string' ? dataCy : `icon-${icon}`}
            disabled={disabled}
            basic={basic}
            active={active}
            {...id ? { id } : {}}
        />
    );
});

IconButton.propTypes = {
    onClick: PropTypes.func,
    onMouseDown: PropTypes.func,
    icon: PropTypes.string.isRequired,
    size: PropTypes.string,
    color: PropTypes.string,
    'data-cy': PropTypes.string,
    disabled: PropTypes.bool,
    basic: PropTypes.bool,
    id: PropTypes.string,
    className: PropTypes.string,
    active: PropTypes.bool,
};

IconButton.defaultProps = {
    onClick: () => {},
    onMouseDown: (e) => { e.preventDefault(); e.stopPropagation(); },
    size: 'mini',
    color: 'grey',
    'data-cy': null,
    disabled: false,
    basic: false,
    id: null,
    className: '',
    active: false,
};

export default IconButton;
