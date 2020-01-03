import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';

export default function IconButton(props) {
    const {
        onClick, icon, size, color, 'data-cy': dataCy, disabled, basic,
    } = props;

    return (
        <Button
            size={size}
            onClick={onClick}
            color={color}
            icon={icon}
            className={`icon-button ${color}`}
            data-cy={dataCy || `icon-${icon}`}
            disabled={disabled}
            basic={basic}
        />
    );
}

IconButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    icon: PropTypes.string.isRequired,
    size: PropTypes.string,
    color: PropTypes.string,
    'data-cy': PropTypes.string,
    disabled: PropTypes.bool,
    basic: PropTypes.bool,
};

IconButton.defaultProps = {
    size: 'mini',
    color: 'grey',
    'data-cy': null,
    disabled: false,
    basic: false,
};
