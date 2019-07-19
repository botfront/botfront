import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';

export default function FloatingIconButton(props) {
    const { onClick, style, icon } = props;

    return (
        <div
            style={style}
            className='floating-icon-button'
            data-cy={icon}
        >
            <Icon
                size='small'
                color='grey'
                name={icon}
                link
                className='viewOnHover'
                onClick={onClick}
            />
        </div>
    );
}

FloatingIconButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    style: PropTypes.object,
    icon: PropTypes.string.isRequired,
};

FloatingIconButton.defaultProps = {
    style: {},
};
