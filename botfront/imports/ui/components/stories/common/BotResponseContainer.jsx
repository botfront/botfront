import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import FloatingIconButton from '../../nlu/common/FloatingIconButton';
import UtteranceInput from '../../utils/UtteranceInput';
import UserUtteranceViewer from '../../utils/UserUtteranceViewer';

const BotResponseContainer = (props) => {
    const {
        value, onInput, onDelete, onAbort,
        onChange,
    } = props;
    const [mode, setMode] = useState(value.text.trim() === '' ? 'edit' : 'view');
    const [input, setInput] = useState();
    useEffect(() => {
        setMode(value.text.trim() === '' ? 'edit' : 'view');
    }, [value]);

    const render = () => {
        if (mode === 'edit') {
            return (
                <UtteranceInput
                    placeholder='Bot says...'
                    fluid
                    value={input}
                    onChange={u => setInput(u)}
                    onValidate={() => onInput(input)}
                />
            );
        }
        return (
            <UserUtteranceViewer
                value={value}
                allowEditing
                size='mini'
                onChange={v => onChange(v)}
            />
        );
    };

    return (
        <div
            className='utterance-container'
            mode={mode}
            agent='bot'
        >
            <div className='inner'>
                {render()}
            </div>
            <FloatingIconButton
                icon='trash'
                onClick={() => {
                    if (mode === 'edit') return onAbort();
                    return onDelete();
                }}
            />
        </div>
    );
};

BotResponseContainer.propTypes = {
    value: PropTypes.object,
    onInput: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onAbort: PropTypes.func.isRequired,
};

BotResponseContainer.defaultProps = {
    value: null,
};

export default BotResponseContainer;
