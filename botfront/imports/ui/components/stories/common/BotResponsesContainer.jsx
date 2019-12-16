import { dump as yamlDump, safeLoad as yamlLoad } from 'js-yaml';
import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Placeholder } from 'semantic-ui-react';

import FloatingIconButton from '../../common/FloatingIconButton';
import { ProjectContext } from '../../../layouts/context';
import BotResponseContainer from './BotResponseContainer';
import ExceptionWrapper from './ExceptionWrapper';

const BotResponsesContainer = (props) => {
    const {
        name,
        onDeleteAllResponses,
        deletable,
        exceptions,
        isNew,
        removeNewState,
        language,
    } = props;
    const { getResponse, updateResponse } = useContext(ProjectContext);
    const [template, setTemplate] = useState(null);
    const [toBeCreated, setToBeCreated] = useState(null);
    const [focus, setFocus] = useState(isNew ? 0 : null);

    const getSequence = () => {
        if (!template) return [];
        if (template.__typename !== 'TextPayload') return [template];
        return template.text.split('\n\n').map(text => ({ __typename: 'TextPayload', text }));
    };

    const newText = { __typename: 'TextPayload', text: '' };

    const setSequence = (newSequence) => {
        if (template.__typename !== 'TextPayload') return setTemplate(newSequence[0]);
        return setTemplate({ __typename: 'TextPayload', text: newSequence.map(seq => seq.text).join('\n\n') });
        // updateResponse(newTemplate);
    };

    useEffect(() => {
        removeNewState();
        if (!/^(utter_)/.test(name)) return;
        getResponse(name).then((response) => {
            if (response) setTemplate(response);
            // create
        });
    }, [language]);

    const handleCreateReponse = (index) => {
        const newSequence = [...getSequence()];
        newSequence.splice(index + 1, 0, newText);
        setFocus(index + 1);
        setSequence(newSequence);
    };

    const handleDeleteResponse = (index) => {
        const newSequence = [...getSequence()];
        newSequence.splice(index, 1);
        // setFocus(index - 1 < 0 ? index + 1 : index - 1);
        setFocus(Math.min(newSequence.length - 1, index - 1));
        setSequence(newSequence);
    };

    const handleChangeResponse = (newContent, index, enter) => {
        setFocus(null);
        const sequence = [...getSequence()];
        const oldContent = sequence[index];
        sequence[index] = { ...oldContent, ...newContent };
        setSequence(sequence);
        if (enter) setToBeCreated(index);
        return true;
    };

    useEffect(() => {
        if (toBeCreated || toBeCreated === 0) {
            handleCreateReponse(toBeCreated);
            setToBeCreated(null);
        }
    }, [toBeCreated]);


    const renderResponse = (response, index, sequenceArray) => (
        <React.Fragment key={index}>
            <div className='flex-right'>
                <BotResponseContainer
                    deletable={deletable && sequenceArray.length > 1}
                    value={response}
                    onDelete={() => handleDeleteResponse(index)}
                    onAbort={() => {}}
                    onChange={(newContent, enter) => handleChangeResponse(newContent, index, enter)
                    }
                    focus={focus === index}
                    onFocus={() => setFocus(index)}
                />
                {index === sequenceArray.length - 1 && (
                    <div className='response-name'>{name}</div>)}
            </div>
        </React.Fragment>
    );

    // if (sequence && !sequence.length) onDeleteAllResponses();
    return (
        <ExceptionWrapper
            exceptions={exceptions}
        >
            <div className='responses-container exception-wrapper'>
                {!template && (
                    <Placeholder>
                        <Placeholder.Line />
                        <Placeholder.Line />
                    </Placeholder>
                )}
                {getSequence().map(renderResponse)}
                {deletable && (
                    <FloatingIconButton icon='trash' onClick={onDeleteAllResponses} />
                )}
            </div>
        </ExceptionWrapper>
    );
};

BotResponsesContainer.propTypes = {
    deletable: PropTypes.bool,
    name: PropTypes.string.isRequired,
    onDeleteAllResponses: PropTypes.func.isRequired,
    exceptions: PropTypes.array,
    isNew: PropTypes.bool.isRequired,
    removeNewState: PropTypes.func.isRequired,
    language: PropTypes.string.isRequired,
};

BotResponsesContainer.defaultProps = {
    deletable: true,
    exceptions: [{ type: null }],
};

export default BotResponsesContainer;
