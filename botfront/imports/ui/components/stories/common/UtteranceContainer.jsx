import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import FloatingIconButton from '../../nlu/common/FloatingIconButton';
import UtteranceInput from '../../utils/UtteranceInput';
import UserUtteranceViewer from '../../utils/UserUtteranceViewer';

const UtteranceContainer = (props) => {
    const {
        agent, value, onInputUserUtterance, onInputBotResponse, onDelete, onAbort,
        onChange, onSave,
    } = props;
    const [mode, setMode] = useState(!value ? 'input' : 'view');
    const [input, setInput] = useState();
    const container = useRef();
    useEffect(() => {
        setMode(!value ? 'input' : 'view');
    }, value);

    const excludedTarget = e => (
        // Check class of element that triggered blur against excluded classNames.
        ['trash'].some(t => !!e.relatedTarget && e.relatedTarget.className.split(' ').includes(t))
    );

    const render = () => {
        if (mode === 'edit') {
            container.current.focus();
        }
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
        return (
            <div
                ref={container}
                className='focus-box'
                role='textbox'
                tabIndex={0}
                onMouseDown={(e) => { e.preventDefault(); }}
                onBlur={(e) => { if (mode === 'edit' && !excludedTarget(e)) onSave(); }}
            >
                {agent === 'user'
                    ? (
                        <UserUtteranceViewer
                            value={value}
                            allowEditing={mode === 'edit'}
                            size='mini'
                            onChange={v => onChange(v)}
                        />
                    )
                    : `Bot response ${mode}`
                }
            </div>
        );
    };

    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        <div
            className='utterance-container'
            mode={mode}
            agent={agent}
        >
            <div className='inner'>
                {render()}
            </div>
            <FloatingIconButton
                icon={mode === 'view' ? 'edit' : 'trash'}
                onClick={() => {
                    if (mode === 'view') return setMode('edit');
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
    onSave: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onAbort: PropTypes.func.isRequired,
};

UtteranceContainer.defaultProps = {
    value: null,
};

export default UtteranceContainer;
