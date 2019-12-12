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
        const response = template.values
            .find(({ lang }) => lang === language);
        if (!response) return [];
        const { sequence } = response;
        if (!sequence) return [];
        return sequence;
    };

    const newText = { content: yamlDump({ text: '' }) };

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

    const handleCreateReponse = (index) => {
        const newSequence = [...getSequence()];
        newSequence.splice(index + 1, 0, newText);
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
        sequence[index].content = yamlDump({ ...oldContent, ...newContent });
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
                    />
                    {index === sequenceArray.length - 1 && (
                        <div className='response-name'>{name}</div>)}
                </div>
            </React.Fragment>
        );
    };

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
