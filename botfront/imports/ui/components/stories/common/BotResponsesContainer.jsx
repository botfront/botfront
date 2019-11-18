import { dump as yamlDump, safeLoad as yamlLoad } from 'js-yaml';
import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Placeholder } from 'semantic-ui-react';

import FloatingIconButton from '../../nlu/common/FloatingIconButton';
import { ConversationOptionsContext } from '../../utils/Context';
import BotResponsePopupContent from './BotResponsePopupContent';
import BotResponseContainer from './BotResponseContainer';
import { defaultTemplate } from './StoryVisualEditor';

const BotResponsesContainer = (props) => {
    const {
        name,
        onDeleteAllResponses,
        deletable,
        exceptions,
        isNew,
        removeNewState,
        language,
        addNewResponse,
    } = props;
    const { getResponse, updateResponse } = useContext(ConversationOptionsContext);
    const [template, setTemplate] = useState(null);
    const [toBeCreated, setToBeCreated] = useState(null);
    const [focus, setFocus] = useState(isNew ? 0 : null);

    const getSequence = () => {
        if (!template) return [];
        const response = template.values
            .find(({ lang }) => lang === language);
        if (!response) return [];
        const { sequence } = response;
        if (!sequence) return [];
        return sequence;
    };

    const setSequence = (newSequence) => {
        const newTemplate = {
            ...template,
            values: [
                ...template.values.map((value, index) => {
                    if (value.lang === language) {
                        return {
                            ...template.values[index],
                            sequence: [...newSequence],
                        };
                    }
                    return value;
                }),
            ],
        };
        setTemplate(newTemplate);
        updateResponse(newTemplate);
    };

    useEffect(() => {
        removeNewState();
        if (!/^(utter_)/.test(name)) return;
        getResponse(name, (err, res) => {
            if (!err) {
                setTemplate(res);
            }
        });
    }, [language]);

    const handleCreateReponse = (index, responseType) => {
        const newSequence = [...getSequence()];
        newSequence.splice(index + 1, 0, {
            content: yamlDump(defaultTemplate(responseType)),
        });
        setFocus(index + 1);
        setSequence(newSequence);
    };

    const handleDeleteResponse = (index) => {
        const newSequence = [...getSequence()];
        newSequence.splice(index, 1);
        if (!newSequence.length) {
            onDeleteAllResponses();
            return;
        }
        setSequence(newSequence);
    };

    const handleChangeResponse = (newContent, index, enter) => {
        setFocus(null);
        const sequence = [...getSequence()];
        const oldContent = yamlLoad(sequence[index].content);
        if (
            newContent.text !== undefined
            && newContent.text.trim() === ''
            && (!oldContent.buttons || !oldContent.buttons.length)
        ) return handleDeleteResponse(index);
        sequence[index].content = yamlDump({ ...oldContent, ...newContent });
        setSequence(sequence);
        if (enter) addNewResponse();
        return true;
    };

    useEffect(() => {
        if (toBeCreated || toBeCreated === 0) {
            handleCreateReponse(toBeCreated, 'text');
            setToBeCreated(null);
        }
    }, [toBeCreated]);

    const [popupOpen, setPopupOpen] = useState(null);

    const renderAddLine = (index) => {
        if (popupOpen !== index) {
            return (
                <FloatingIconButton
                    icon='ellipsis horizontal'
                    size='medium'
                    onClick={() => setPopupOpen(index)}
                />
            );
        }
        return (
            <BotResponsePopupContent
                onSelect={() => { }} // not needed for now
                onCreate={(responseType) => {
                    setPopupOpen(null);
                    handleCreateReponse(index, responseType);
                }}
                onClose={() => setPopupOpen(null)}
                limitedSelection
                disableExisting
                noButtonResponse={index !== getSequence().length - 1}
                defaultOpen
                trigger={(
                    <FloatingIconButton
                        icon='ellipsis horizontal'
                        visible
                        size='medium'
                        onClick={() => setPopupOpen(index)}
                    />
                )}
            />
        );
    };

    const renderResponse = (response, index, sequenceArray) => {
        const content = yamlLoad(response.content);
        return (
            <React.Fragment key={index}>
                <div className='flex-right'>
                    <BotResponseContainer
                        deletable={deletable || sequenceArray.length > 1}
                        value={content}
                        onDelete={() => handleDeleteResponse(index)}
                        onAbort={() => { }}
                        onChange={(newContent, enter) => handleChangeResponse(newContent, index, enter)
                        }
                        focus={focus === index}
                        onFocus={() => setFocus(index)}
                    />
                </div>

            </React.Fragment>
        );
    };

    const isSequence = () => {
        if (template) return template.values[0].sequence.length > 1;
        return false;
    };
    // if (sequence && !sequence.length) onDeleteAllResponses();
    return (
        <div className={`responses-container exception-wrapper ${isSequence() ? 'multiple' : ''}`} exception={exceptions.severity}>
            {!template && (
                <Placeholder>
                    <Placeholder.Line />
                    <Placeholder.Line />
                </Placeholder>
            )}
            {getSequence().map(renderResponse)}
            {deletable && isSequence() && (
                <FloatingIconButton icon='trash' onClick={onDeleteAllResponses} />
            )}
            <div className='response-name'>{name}</div>
        </div>
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
    addNewResponse: PropTypes.func.isRequired,
};

BotResponsesContainer.defaultProps = {
    deletable: true,
    exceptions: [{ type: null }],

};

export default BotResponsesContainer;
