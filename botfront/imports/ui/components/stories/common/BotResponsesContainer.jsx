import { dump as yamlDump, safeLoad as yamlLoad } from 'js-yaml';
import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import FloatingIconButton from '../../nlu/common/FloatingIconButton';
import { ConversationOptionsContext } from '../../utils/Context';
import BotResponsePopupContent from './BotResponsePopupContent';
import BotResponseContainer from './BotResponseContainer';
import { defaultTemplate } from './StoryVisualEditor';

const BotResponsesContainer = (props) => {
    const { name, onDeleteAllResponses, deletable } = props;
    const { getResponse, updateResponse } = useContext(
        ConversationOptionsContext,
    );

    const [template, setTemplate] = useState(null);
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
                if (!res.templates) {
                    getResponse(name, (err2, res2) => {
                        if (!err2) setTemplate(res2.templates[0]);
                    });
                    return;
                }
                setTemplate(res.templates[0]);
            }
        });
    }, []);

    const handleCreateReponse = (index, responseType) => {
        const newSequence = [...getSequence()];
        newSequence.splice(index + 1, 0, yamlDump(defaultTemplate(responseType)));
        setSequence(newSequence);
    };

    const handleChangeResponse = (newResponse, index) => {
        const newSequence = [...getSequence()];
        newSequence[index] = { content: newResponse };
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
                    onChange={content => handleChangeResponse(yamlDump(content), index)}
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
