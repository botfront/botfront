import React, { useState, useEffect, useRef } from 'react';
import { Icon } from 'semantic-ui-react';
import PropTypes from 'prop-types';

const ExceptionWrapper = (props) => {
    const { hasError, hasWarning, children, className } = props;

    const generateClassName = () => {
        let fullClassName = 'story-line ';
        if (hasWarning) {
            fullClassName = `${fullClassName} has-warning`;
        }
        if (hasError) {
            fullClassName = `${fullClassName} has-error`;
        }
        return fullClassName;
    };

    return (
        <span className={`${generateClassName()} ${className}`}>
            <Icon name='exclamation circle' color='yellow' className='warning-indicator' />
            <Icon name='times circle' color='red' className='error-indicator' />
            {children}
        </span>
    );
};

ExceptionWrapper.propTypes = {
    hasError: PropTypes.bool,
    hasWarning: PropTypes.bool,
    children: PropTypes.element,
};

ExceptionWrapper.defaultProps = {
    hasError: true,
    hasWarning: true,
    children: <></>,
};

export default ExceptionWrapper;
