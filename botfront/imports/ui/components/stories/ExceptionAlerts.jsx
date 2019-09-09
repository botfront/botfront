import React from 'react';
import { Icon, Popup } from 'semantic-ui-react';
import PropTypes from 'prop-types';

const ExceptionAlerts = (props) => {
    const { hasErrors, hasWarnings } = props;

    const renderErrorAlert = () => (
        <Popup
            position='top center'
            inverted
            size='tiny'
            trigger={
                <Icon name='times circle' color='red' />
            }
        >
            <p className='exception-popup'>This story group contains errors preventing it from being trained.</p>
        </Popup>
    );

    const renderWarningAlert = () => (
        <Popup
            inverted
            size='tiny'
            position='top center'
            trigger={
                <Icon name='exclamation circle' color='yellow' />
            }
        >
            <p className='exception-popup'>This story group contains warnings.</p>
        </Popup>
    );

    return (
        <>
            {hasErrors && renderErrorAlert()}
            {hasWarnings && renderWarningAlert()}
        </>
    );
};
ExceptionAlerts.propTypes = {
    hasErrors: PropTypes.bool.isRequired,
    hasWarnings: PropTypes.bool.isRequired,
};

export default ExceptionAlerts;
