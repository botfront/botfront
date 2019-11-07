import React from 'react';
import { Icon, Popup } from 'semantic-ui-react';
import PropTypes from 'prop-types';

const ExceptionWrapper = (props) => {
    const { children, exceptions } = props;
    const errors = exceptions.filter(({ type }) => type === 'error');
    const warnings = exceptions.filter(({ type }) => type === 'warning');

    const generateClassName = () => {
        let fullClassName = 'story-line ';
        if (warnings.length > 0) {
            fullClassName = `${fullClassName} has-warning`;
        }
        if (errors.length > 0) {
            fullClassName = `${fullClassName} has-error`;
        }
        return fullClassName;
    };

    const renderPopupContent = content => content.map(({ message, type }, index) => (
        <p key={`${type}-${index}`}>{message}</p>
    ));
    return (
        <span className={generateClassName()}>
            <Popup
                wide
                position='left center'
                header={`Warning${warnings.length > 1 ? 's' : ''}`}
                content={renderPopupContent(warnings)}
                trigger={(
                    <Icon
                        name='exclamation circle'
                        color='yellow'
                        className='warning-indicator'
                    />
                )}
            />
            <Popup
                wide
                position='left center'
                header={`Error${errors.length > 1 ? 's' : ''}`}
                content={renderPopupContent(errors)}
                trigger={
                    <Icon name='times circle' color='red' className='error-indicator' />
                }
            />
            {children}
        </span>
    );
};

ExceptionWrapper.propTypes = {
    exceptions: PropTypes.array,
    children: PropTypes.node,
};

ExceptionWrapper.defaultProps = {
    children: <></>,
    exceptions: [{ type: null, message: '' }],
};

export default ExceptionWrapper;
