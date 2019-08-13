import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import TextareaAutosize from 'react-autosize-textarea';
import QuickReplies from './QuickReplies';

import FloatingIconButton from '../../nlu/common/FloatingIconButton';

const QRContainer = (props) => {
    const {
        value, onDelete, onChange, deletable,
    } = props;

    const [input, setInput] = useState(value.text);

    useEffect(() => {
        setInput(value.text);
    }, [value]);

    const renderText = () => (
        <TextareaAutosize
            placeholder='Type a message'
            role='button'
            tabIndex={0}
            value={input}
            onChange={event => setInput(event.target.value)}
            onBlur={() => onChange({ text: input }, false)}
        />
    );

    const renderButtons = () => (
        <QuickReplies
            value={value.buttons}
            onChange={(newButtons) => { onChange({ buttons: newButtons }, false); }}
        />
    );

    return (
        <div className='utterance-container bot-response' agent='bot' data-cy='bot-response-input'>
            <div className='inner'>
                {renderText()}
                {renderButtons()}
            </div>
            {deletable && <FloatingIconButton icon='trash' onClick={() => onDelete()} />}
        </div>
    );
};

QRContainer.propTypes = {
    deletable: PropTypes.bool,
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

QRContainer.defaultProps = {
    deletable: true,
};

export default QRContainer;
