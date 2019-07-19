import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Grid, Icon, Input } from 'semantic-ui-react';
import FloatingIconButton from '../../nlu/common/FloatingIconButton';
import UtteranceInput from '../../utils/UtteranceInput';
import UserUtteranceViewer from '../../utils/UserUtteranceViewer';

const UtteranceContainer = (props) => {
    const {
        agent, value, onInputNewUserUtterance, onInputNewBotResponse, onDelete, onAbort,
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
                        if (agent === 'bot') onInputNewBotResponse(input);
                        else onInputNewUserUtterance(input);
                    }}
                />
            );
        }
        if (agent === 'user') {
            return (
                <UserUtteranceViewer
                    value={value}
                    allowEditing={mode === 'edit'}
                    size='mini'
                    // onChange={() => onChangeValue()}
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
    onInputNewUserUtterance: PropTypes.func.isRequired,
    onInputNewBotResponse: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onAbort: PropTypes.func.isRequired,
};

UtteranceContainer.defaultProps = {
    value: null,
};

export default UtteranceContainer;
