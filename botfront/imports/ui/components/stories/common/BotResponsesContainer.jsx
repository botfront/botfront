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
        hasError,
        hasWarning
    } = props;
    const { getResponse, updateResponse } = useContext(ConversationOptionsContext);

    const [template, setTemplate] = useState(null);
    const [toBeCreated, setToBeCreated] = useState(null);
    const [focus, setFocus] = useState(isNew ? 0 : null);

    const getSequence = () => {
        if (!template) return [];
        return template.values[0].sequence;
    };

    const setSequence = (newSequence) => {
        const newTemplate = {
            ...template,
            values: [
                {
                    ...template.values[0],
                    sequence: newSequence,
                },
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
    }, []);

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
        if (enter) setToBeCreated(index);
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
                onSelect={() => {}} // not needed for now
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
                        onAbort={() => {}}
                        onChange={(newContent, enter) => handleChangeResponse(newContent, index, enter)
                        }
                        focus={focus === index}
                        onFocus={() => setFocus(index)}
                        hasError={hasError}
                        hasWarning={hasWarning}
                    />
                </div>
                {!content.buttons
                    && renderAddLine(index) /* add line button if no buttons */}
            </React.Fragment>
        );
    };

    // if (sequence && !sequence.length) onDeleteAllResponses();
    return (
        <div className='responses-container' exception={exceptions.severity}>
            {renderAddLine(-1)}
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
            <div className='response-name'>{name}</div>
        </div>
    );
};

BotResponsesContainer.propTypes = {
    deletable: PropTypes.bool,
    name: PropTypes.string.isRequired,
    onDeleteAllResponses: PropTypes.func.isRequired,
    exceptions: PropTypes.object,
    isNew: PropTypes.bool.isRequired,
    removeNewState: PropTypes.func.isRequired,
    hasError: PropTypes.bool,
    hasWarning: PropTypes.warning,
};

BotResponsesContainer.defaultProps = {
    deletable: true,
    exceptions: { severity: null, messages: [] },
    hasError: false,
    hasWarning: false,

};

export default BotResponsesContainer;
