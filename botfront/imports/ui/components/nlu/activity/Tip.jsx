import React from 'react';
import PropTypes from 'prop-types';
import { Popup, Icon, Message } from 'semantic-ui-react';


export default function Tip({
    title, description, iconName, iconColor, iconSize, type, flowing, hoverable,
}) {
    return (
        <div className='warning_container'>
            <Popup
                basic
                trigger={<Icon name={iconName} color={iconColor} size={iconSize} />}
                content={(
                    <Message
                        style={{ maxWidth: '400px', textAlign: 'center' }}
                        position='top left'
                        warning={type === 'warning'}
                        info={type === 'info'}
                        negative={type === 'negative'}
                        header={title}
                        content={description}
                    />
                )}
                flowing
                hoverable
            />
        </div>
    );
}

Tip.defaultProps = {
    hoverable: false,
    flowing: false,
    iconColor: 'grey',
    type: null,
    iconSize: null,
};

Tip.propTypes = {
    title: PropTypes.string.isRequired,
    iconName: PropTypes.string.isRequired,
    iconColor: PropTypes.string,
    iconSize: PropTypes.string,
    type: PropTypes.string,
    description: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    flowing: PropTypes.bool,
    hoverable: PropTypes.bool,
};
