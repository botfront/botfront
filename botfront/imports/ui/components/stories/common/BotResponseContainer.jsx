import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import TextareaAutosize from 'react-autosize-textarea';

import FloatingIconButton from '../../nlu/common/FloatingIconButton';

const BotResponseContainer = (props) => {
    const {
        value, onDelete, onChange, deletable,
    } = props;

    const [input, setInput] = useState();

    useEffect(() => {
        setInput(value.text);
    }, [value]);

    const render = () => (
        <TextareaAutosize
            className='bot-response-input'
            role='button'
            tabIndex={0}
            value={input}
            onChange={event => setInput(event.target.value)}
            onBlur={() => onChange({ text: input })}
        />
    );

    return (
        <div className='utterance-container bot-response' agent='bot'>
            <div className='inner'>{render()}</div>
            {deletable && <FloatingIconButton icon='trash' onClick={() => onDelete()} />}
        </div>
    );
};

BotResponseContainer.propTypes = {
    deletable: PropTypes.bool,
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

BotResponseContainer.defaultProps = {
    deletable: true,
};

export default BotResponseContainer;
