import React from 'react';
import { Icon, Popup } from 'semantic-ui-react';
import PropTypes from 'prop-types';

const ExceptionAlerts = (props) => {
    const { errors, warnings } = props;

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
            {errors && errors.length > 0 && renderErrorAlert()}
            {warnings && warnings.length > 0 && renderWarningAlert()}
        </>
    );
};
ExceptionAlerts.propTypes = {
    errors: PropTypes.array,
    warnings: PropTypes.array,
};
ExceptionAlerts.defaultProps = {
    errors: [],
    warnings: [],
};

export default ExceptionAlerts;
