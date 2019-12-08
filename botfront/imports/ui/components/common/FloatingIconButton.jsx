import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Popup } from 'semantic-ui-react';

export default function FloatingIconButton(props) {
    const {
        onClick, style, icon, size: sizeProp, color, iconClass, toolTip, toolTipInverted, disabled, visible,
    } = props;
    const size = sizeProp === 'medium' ? null : { size: sizeProp };

    return (
        <div
            style={style}
            className={`floating-icon-button${visible ? ' visible' : ''} ${icon}`}
            data-cy={icon}
        >
            <Popup
                pinned
                position='top center'
                disabled={toolTip === null}
                trigger={(
                    <Icon
                        {...size}
                        color={color}
                        name={icon}
                        // https://stackoverflow.com/questions/42764494/blur-event-relatedtarget-returns-null
                        // this prop allows the icon to become focused
                        tabIndex={0}
                        link
                        disabled={disabled}
                        className={iconClass}
                        onClick={onClick}
                        data-cy={`icon-${icon}`}
                    />
                )}
                inverted={toolTipInverted}
            >
                {toolTip}
            </Popup>

        </div>
    );
}

FloatingIconButton.propTypes = {
    toolTip: PropTypes.object,
    toolTipInverted: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    style: PropTypes.object,
    icon: PropTypes.string.isRequired,
    size: PropTypes.string,
    color: PropTypes.string,
    visible: PropTypes.bool,
    iconClass: PropTypes.string,
    disabled: PropTypes.bool,
};

FloatingIconButton.defaultProps = {
    style: {},
    size: 'small',
    color: 'grey',
    visible: false,
    iconClass: 'viewOnHover',
    toolTip: null,
    toolTipInverted: true,
    disabled: false,
};
