import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';

export default function FloatingIconButton(props) {
    const {
        onClick, style, icon, size: sizeProp, color, iconClass,
    } = props;
    const size = sizeProp === 'medium' ? null : { size: sizeProp };

    return (
        <div
            style={style}
            className='floating-icon-button'
            data-cy={icon}
        >
            <Icon
                {...size}
                color={color}
                name={icon}
                // https://stackoverflow.com/questions/42764494/blur-event-relatedtarget-returns-null
                // this prop allows the icon to become focused
                tabIndex={0}
                link
                className={iconClass}
                onClick={onClick}
            />
        </div>
    );
}

FloatingIconButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    style: PropTypes.object,
    icon: PropTypes.string.isRequired,
    size: PropTypes.string,
    color: PropTypes.string,
    iconClass: PropTypes.string,
};

FloatingIconButton.defaultProps = {
    style: {},
    size: 'small',
    color: 'grey',
    iconClass: 'viewOnHover',
};
