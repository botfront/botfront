import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import FloatingIconButton from '../../nlu/common/FloatingIconButton';
import UtteranceInput from '../../utils/UtteranceInput';
import UserUtteranceViewer from '../../utils/UserUtteranceViewer';

const UtteranceContainer = (props) => {
    const {
        agent, value, onInputUserUtterance, onInputBotResponse, onDelete, onAbort,
        onChange,
    } = props;
    const [mode, setMode] = useState(!value ? 'input' : 'view');
    const [input, setInput] = useState();
    useEffect(() => {
        setMode(!value ? 'input' : 'view');
    }, value);

    const render = () => {
        if (mode === 'input') {
            return (
                <UtteranceInput
                    placeholder={agent === 'bot' ? 'Bot says...' : 'User says...'}
                    fluid
                    value={input}
                    onChange={u => setInput(u)}
                    onValidate={() => {
                        if (agent === 'bot') onInputBotResponse(input);
                        else onInputUserUtterance(input);
                    }}
                />
            );
        }
        if (agent === 'user') {
            return (
                <UserUtteranceViewer
                    value={value}
                    allowEditing
                    size='mini'
                    onChange={v => onChange(v)}
                />
            );
        }
        return (
            <div>{`Bot response ${mode}`}</div>
        );
    };

    return (
        <div
            className='utterance-container'
            mode={mode}
            agent={agent}
        >
            <div className='inner'>
                {render()}
            </div>
            <FloatingIconButton
                icon='trash'
                onClick={() => {
                    if (mode === 'input') return onAbort();
                    return onDelete();
                }}
            />
        </div>
    );
};

UtteranceContainer.propTypes = {
    agent: PropTypes.oneOf(['bot', 'user']).isRequired,
    value: PropTypes.object,
    onInputUserUtterance: PropTypes.func.isRequired,
    onInputBotResponse: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onAbort: PropTypes.func.isRequired,
};

UtteranceContainer.defaultProps = {
    value: null,
};

export default UtteranceContainer;
