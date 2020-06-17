import React from 'react';
import PropTypes from 'prop-types';
import { Popup } from 'semantic-ui-react';
import IconButton from '../../common/IconButton';

const ButtonTypeToggle = (props) => {
    const { className, responseType, onToggleButtonType } = props;

    const renderPopupContent = () => {
        if (responseType === 'TextWithButtonsPayload') {
            return 'the button will disappear when a new message is added to the conversation';
        }
        if (responseType === 'QuickRepliesPayload') {
            return 'the button will remain visible and clickable';
        }
        return <></>;
    };

    const renderPopupHeader = () => {
        if (responseType === 'TextWithButtonsPayload') {
            return 'Disable persistence';
        }
        if (responseType === 'QuickRepliesPayload') {
            return 'Enable persistence';
        }
        return <></>;
    };
    
    return (
        <>
            {(responseType === 'TextWithButtonsPayload' || responseType === 'QuickRepliesPayload') && (
                <Popup
                    className='toggle-button-type-tooltip'
                    on='hover'
                    trigger={(
                        <span className='button-type-toggle'>
                            <IconButton
                                icon='pin'
                                color={null}
                                className={`${responseType === 'TextWithButtonsPayload' ? 'light-green' : 'grey'} ${className}`}
                                onClick={onToggleButtonType}
                            />
                        </span>
                    )}
                    header={renderPopupHeader()}
                    content={renderPopupContent()}
                />
            )}
        </>
    );
};

ButtonTypeToggle.propTypes = {
    onToggleButtonType: PropTypes.func.isRequired,
    responseType: PropTypes.string,
    className: PropTypes.string,
};

ButtonTypeToggle.defaultProps = {
    className: '',
    responseType: null,
};

export default ButtonTypeToggle;
