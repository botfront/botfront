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
    const { name, onDeleteAllResponses, deletable } = props;
    const { getResponse, updateResponse } = useContext(ConversationOptionsContext);

    const [template, setTemplate] = useState(null);
    const [toBeCreated, setToBeCreated] = useState(null);
    const [focus, setFocus] = useState(null);

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
        const templateToUpload = {
            ...template,
            values: [
                {
                    ...template.values[0],
                    sequence: newTemplate.values[0].sequence.filter(
                        response => yamlLoad(response.content).text,
                    ),
                },
            ],
        };
        updateResponse(templateToUpload);
    };

    useEffect(() => {
        if (!/^(utter_)/.test(name)) return;
        getResponse(name, (err, res) => {
            if (!err) {
                setTemplate(res);
            }
        });
    }, []);

    const handleCreateReponse = (index, responseType) => {
        const newSequence = [...getSequence()];
        newSequence.splice(index + 1, 0, { content: yamlDump(defaultTemplate(responseType)) });
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

    const handleChangeResponse = (newResponse, index, enter) => {
        if (newResponse.trim() === '') { setFocus(null); return handleDeleteResponse(index); }
        const newSequence = [...getSequence()];
        newSequence[index] = { content: yamlDump({ text: newResponse }) };
        setSequence(newSequence);
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

    const renderResponse = (response, index, sequenceArray) => (
        <React.Fragment key={index}>
            <div className='flex-right'>
                <BotResponseContainer
                    deletable={deletable || sequenceArray.length > 1}
                    value={response.content ? yamlLoad(response.content) : { text: '' }}
                    onDelete={() => handleDeleteResponse(index)}
                    onAbort={() => {}}
                    onChange={({ text, enter }) => handleChangeResponse(text, index, enter)}
                    focus={focus === index}
                    autoFocus={template.values[0].sequence.length === 1}
                    onFocus={() => setFocus(index)}
                />
                {/* {index === 0 && deletable && sequenceArray.length > 1 && (
                    <FloatingIconButton icon='trash' onClick={onDeleteAllResponses} />
                )} */}
            </div>
            {renderAddLine(index)}
        </React.Fragment>
    );

    // if (sequence && !sequence.length) onDeleteAllResponses();
    return (
        <div className='responses-container'>
            {renderAddLine(-1)}
            {!template && (
                <Placeholder>
                    <Placeholder.Line />
                    <Placeholder.Line />
                </Placeholder>
            )}
            {getSequence().map(renderResponse)}
            <div className='response-name'>{name}</div>
        </div>
    );
};

BotResponsesContainer.propTypes = {
    deletable: PropTypes.bool,
    name: PropTypes.string.isRequired,
    onDeleteAllResponses: PropTypes.func.isRequired,
};

BotResponsesContainer.defaultProps = {
    deletable: true,
};

export default BotResponsesContainer;
