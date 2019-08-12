import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import TextareaAutosize from 'react-autosize-textarea';

import FloatingIconButton from '../../nlu/common/FloatingIconButton';

const BotResponseContainer = (props) => {
    const {
        value, onDelete, onChange, deletable, focus, onFocus, autoFocus,
    } = props;

    const [input, setInput] = useState();
    const focusGrabber = useRef();

    useEffect(() => {
        setInput(value.text);
        if (focus) focusGrabber.current.focus();
    }, [value, focus]);

    const render = () => (
        <TextareaAutosize
            ref={focusGrabber}
            placeholder='Type a message'
            role='button'
            autoFocus={autoFocus}
            tabIndex={0}
            value={input}
            onChange={event => setInput(event.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    onChange({ text: input, enter: true });
                }
            }}
            onFocus={() => onFocus()}
            onBlur={() => onChange({ text: input, enter: false })}
        />
    );

    return (
        <div className='utterance-container bot-response' agent='bot' data-cy='bot-response-input'>
            <div className='inner'>{render()}</div>
            {deletable && <FloatingIconButton icon='trash' onClick={() => onDelete()} />}
        </div>
    );
};

BotResponseContainer.propTypes = {
    deletable: PropTypes.bool,
    value: PropTypes.object.isRequired,
    focus: PropTypes.bool,
    autoFocus: PropTypes.bool,
    onFocus: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

BotResponseContainer.defaultProps = {
    deletable: true,
    focus: false,
    autoFocus: false,
};

export default BotResponseContainer;
