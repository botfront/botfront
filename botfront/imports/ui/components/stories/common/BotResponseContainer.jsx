import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import TextareaAutosize from 'react-autosize-textarea';
import QuickReplies from './QuickReplies';
import FloatingIconButton from '../../nlu/common/FloatingIconButton';

const BotResponseContainer = (props) => {
    const {
        value, onDelete, onChange, deletable, focus, onFocus,
    } = props;

    const [input, setInput] = useState();
    const focusGrabber = useRef();
    const isTextResponse = Object.keys(value).length === 1 && Object.keys(value)[0] === 'text';
    const hasText = Object.keys(value).includes('text');
    const hasButtons = Object.keys(value).includes('buttons');

    useEffect(() => {
        setInput(value.text);
        if (focus) focusGrabber.current.focus();
    }, [value, focus]);

    const renderText = () => (
        <TextareaAutosize
            ref={focusGrabber}
            placeholder='Type a message'
            role='button'
            tabIndex={0}
            value={input}
            onChange={event => setInput(event.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && isTextResponse) {
                    e.preventDefault();
                    onChange({ text: input }, true);
                }
            }}
            onFocus={() => onFocus()}
            onBlur={() => onChange({ text: input }, false)}
        />
    );

    const renderButtons = () => (
        <QuickReplies
            value={value.buttons}
            onChange={(newButtons) => {
                onChange({ buttons: newButtons }, false);
            }}
        />
    );

    return (
        <div
            className='utterance-container bot-response'
            agent='bot'
            data-cy='bot-response-input'
        >
            <div className='inner'>
                {hasText && renderText()}
                {hasButtons && renderButtons()}
            </div>
            {deletable && <FloatingIconButton icon='trash' onClick={() => onDelete()} />}
        </div>
    );
};

BotResponseContainer.propTypes = {
    deletable: PropTypes.bool,
    value: PropTypes.object.isRequired,
    focus: PropTypes.bool,
    onFocus: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

BotResponseContainer.defaultProps = {
    deletable: true,
    focus: false,
};

export default BotResponseContainer;
