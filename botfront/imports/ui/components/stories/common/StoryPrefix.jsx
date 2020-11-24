import React from 'react';
import PropTypes from 'prop-types';

const StoryPrefix = (props) => {
    const {
        fragment,
        className,
    } = props;

    const getContent = () => {
        switch (fragment?.type) {
        case 'test_case':
            if (fragment?.testResults?.success === false) {
                return '✘✘';
            }
            return '✔✔';
        case 'story':
            return '##';
        case 'rule':
            return '>>';
        default: return '';
        }
    };

    const getConditionalClassNames = () => {
        let classNames = '';
        if (fragment?.testResults?.success === false) {
            classNames = `${classNames} failing-test-case-prefix`;
        }
        return classNames;
    };

    return (
        <span className={`story-title-prefix ${className} ${getConditionalClassNames()}`}>
            {getContent()}
        </span>
    );
};

StoryPrefix.propTypes = {
    className: PropTypes.string,
    fragment: PropTypes.string,
};

StoryPrefix.defaultProps = {
    className: '',
    fragment: null,
};


export default StoryPrefix;
