/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Placeholder } from 'semantic-ui-react';

import IconButton from '../../common/IconButton';
import BotResponseEditor from '../../templates/templates-list/BotResponseEditor';
import BotResponseContainer from './BotResponseContainer';
import ExceptionWrapper from './ExceptionWrapper';

import { checkMetadataSet } from '../../templates/botResponse.utils';

const BotResponsesContainer = (props) => {
    const {
        name,
        initialValue,
        onChange,
        onDeleteAllResponses,
        deletable,
        exceptions,
        isNew,
        refreshBotResponse,
        enableEditPopup,
        tag,
    } = props;
    const [template, setTemplate] = useState(initialValue || null);
    const [editorOpen, setEditorOpen] = useState(false);
    const [toBeCreated, setToBeCreated] = useState(null);
    const [focus, setFocus] = useState(isNew ? 0 : null);

    useEffect(() => {
        setTemplate(initialValue);
    }, [initialValue]);

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
                metadata: template.metadata,
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
                    tag={tag}
                    deletable={deletable && sequenceArray.length > 1}
                    value={response}
                    onDelete={() => handleDeleteResponse(index)}
                    onAbort={() => {}}
                    onChange={(newContent, enter) => handleChangeResponse(newContent, index, enter)}
                    focus={focus === index}
                    onFocus={() => setFocus(index)}
                    editCustom={() => setEditorOpen(true)}
                    hasMetadata={template && checkMetadataSet(template.metadata)}
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
                <div className='side-by-side right narrow top-right'>
                    {enableEditPopup && (
                        <BotResponseEditor
                            trigger={(
                                <IconButton
                                    icon='ellipsis vertical'
                                    onClick={() => setEditorOpen(true)}
                                    data-cy='edit-responses'
                                    className={template && checkMetadataSet(template.metadata) ? 'light-green' : 'grey'}
                                    color={null} // prevent default color overiding the color set by the class
                                />
                            )}
                            open={editorOpen}
                            name={name}
                            closeModal={() => setEditorOpen(false)}
                            renameable={false}
                            refreshBotResponse={refreshBotResponse} // required to update the response in the visual story editor
                        />
                    )}
                    { deletable && onDeleteAllResponses && (
                        <IconButton onClick={onDeleteAllResponses} icon='trash' />
                    )}
                </div>
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
    refreshBotResponse: PropTypes.func,
    enableEditPopup: PropTypes.bool,
    tag: PropTypes.string,
};

BotResponsesContainer.defaultProps = {
    deletable: true,
    name: null,
    initialValue: null,
    onChange: () => {},
    onDeleteAllResponses: null,
    exceptions: [{ type: null }],
    refreshBotResponse: () => {},
    enableEditPopup: true,
    tag: null,
};

export default BotResponsesContainer;
