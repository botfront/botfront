import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './QuickReply.import.less';
import { Popup } from 'semantic-ui-react';
import ResponseButtonEditor from './ResponseButtonEditor';

function QuickReply({
    value, onChange, onDelete, showDelete, valid,
}) {
    const button = (
        <button
            type='button'
            className={`quick-reply ${valid ? '' : 'invalid'}`}
        >
            {value.title || 'Button title'}
        </button>
    );

    const [isOpen, setIsOpen] = useState(!valid);

    return (
        <>
            <Popup
                wide='very'
                trigger={button}
                on='click'
                open={isOpen}
                onOpen={() => setIsOpen(true)}
                onClose={() => setIsOpen(false)}
            >
                <ResponseButtonEditor
                    value={value}
                    onChange={onChange}
                    onDelete={onDelete}
                    onClose={() => setIsOpen(false)}
                    showDelete={showDelete}
                    valid={valid}
                />
            </Popup>
        </>
    );
}

QuickReply.propTypes = {
    value: PropTypes.shape({
        title: PropTypes.string.isRequired,
        type: PropTypes.oneOf(['postback', 'url']),
        payload: PropTypes.string.isRequired,
    }).isRequired,
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    open: PropTypes.func,
};

QuickReply.defaultProps = {
    open: false,
};

export default QuickReply;
