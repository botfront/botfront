/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Placeholder } from 'semantic-ui-react';

import FloatingIconButton from '../../common/FloatingIconButton';
import BotResponseContainer from './BotResponseContainer';
import ExceptionWrapper from './ExceptionWrapper';

const BotResponsesContainer = (props) => {
    const {
        name,
        initialValue,
        onChange,
        onDeleteAllResponses,
        deletable,
        exceptions,
        isNew,
    } = props;
    const [template, setTemplate] = useState(initialValue || null);
    const [toBeCreated, setToBeCreated] = useState(null);
    const [focus, setFocus] = useState(isNew ? 0 : null);

    const newText = { __typename: 'TextPayload', text: '' };

    const getSequence = () => {
        if (!template) return [];
        if (template.__typename !== 'TextPayload') return [template];
        return template.text
            .split('\n\n')
            .map(text => ({ __typename: 'TextPayload', text }));
    };

    const setSequence = (newSequence) => {
        if (template.__typename === 'TextPayload') {
            const newTemplate = {
                __typename: 'TextPayload',
                text: newSequence.map(seq => seq.text).join('\n\n'),
            };
            onChange(newTemplate);
            return setTemplate(newTemplate);
        }
        onChange(newSequence[0]);
        return setTemplate(newSequence[0]);
    };

    const handleCreateReponse = (index) => {
        const newSequence = [...getSequence()];
        newSequence.splice(index + 1, 0, newText);
        setFocus(index + 1);
        setSequence(newSequence);
    };

    const handleDeleteResponse = (index) => {
        const newSequence = [...getSequence()];
        newSequence.splice(index, 1);
        const oneUp = Math.min(index, newSequence.length - 1);
        const oneDown = Math.max(0, index - 1);
        setSequence(newSequence);
        setFocus(Math.min(oneDown, oneUp));
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
        <React.Fragment
            key={`${response.text}-${(sequenceArray[index + 1] || {}).text}-${index}`}
        >
            <div className='flex-right'>
                <BotResponseContainer
                    deletable={deletable && sequenceArray.length > 1}
                    value={response}
                    onDelete={() => handleDeleteResponse(index)}
                    onAbort={() => {}}
                    onChange={(newContent, enter) => handleChangeResponse(newContent, index, enter)}
                    focus={focus === index}
                    onFocus={() => setFocus(index)}
                />
                {index === sequenceArray.length - 1 && name && (
                    <div className='response-name'>{name}</div>
                )}
            </div>
        </React.Fragment>
    );

    return (
        <ExceptionWrapper exceptions={exceptions}>
            <div className='responses-container exception-wrapper'>
                {!template && (
                    <Placeholder>
                        <Placeholder.Line />
                        <Placeholder.Line />
                    </Placeholder>
                )}
                {getSequence().map(renderResponse)}
                {deletable && onDeleteAllResponses && (
                    <FloatingIconButton icon='trash' onClick={onDeleteAllResponses} />
                )}
            </div>
        </ExceptionWrapper>
    );
};

BotResponsesContainer.propTypes = {
    deletable: PropTypes.bool,
    name: PropTypes.string,
    initialValue: PropTypes.object,
    onChange: PropTypes.func,
    onDeleteAllResponses: PropTypes.func,
    exceptions: PropTypes.array,
    isNew: PropTypes.bool.isRequired,
};

BotResponsesContainer.defaultProps = {
    deletable: true,
    name: null,
    initialValue: null,
    onChange: () => {},
    onDeleteAllResponses: null,
    exceptions: [{ type: null }],
};

export default BotResponsesContainer;
