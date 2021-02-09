import React from 'react';
import { Button, Icon } from 'semantic-ui-react';
import PropTypes from 'prop-types';

const ConditionButton = (props) => {
    const { label, onClick, type } = props;

    const getClassName = () => {
        if (type === 'delGroup') {
            return 'delete-condition-group';
        }
        return '';
    };
    if (type === 'delRule' || type === 'delGroup') {
        return (
            <Icon
                name='trash'
                link
                onClick={onClick}
                className={getClassName()}
            />
        );
    }
    return (
        <Button
            basic
            onClick={onClick}
            compact
            className='condition-button'
        >
            {label}
        </Button>
    );
};

ConditionButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
    label: PropTypes.string,
};

ConditionButton.defaultProps = {
    label: '',
};

export default ConditionButton;
