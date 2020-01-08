import React, { useState, useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { safeDump, safeLoad } from 'js-yaml';
import { useMutation, useSubscription, useQuery } from '@apollo/react-hooks';
import {
    Segment, Menu, MenuItem, Modal, Button,
} from 'semantic-ui-react';
// connections
import { CREATE_BOT_RESPONSE, UPDATE_BOT_RESPONSE, DELETE_VARIATION } from '../mutations';
import { RESPONSES_MODIFIED } from './subscriptions';
import { GET_BOT_RESPONSE } from '../queries';
// components
import { ProjectContext } from '../../../layouts/context';
import SequenceEditor from './SequenceEditor';
import MetadataForm from '../MetadataForm';
import ResponseNameInput from '../common/ResponseNameInput';
// utils
import {
    createResponseFromTemplate,
    checkResponseEmpty,
    addResponseLanguage,
    getDefaultTemplateFromSequence,
    addContentType,
} from '../botResponse.utils';
import { clearTypenameField } from '../../../../lib/utils';


/*
Bot response Editor requireds one of: botResponse, name, or isNew.
botResponse is a full bot response object passed from its parent
name is the response key which bot response editor will use to fetch the response
isNew will create a new response that is saved on modal close
*/

const BotResponseEditor = (props) => {
    const {
        botResponse,
        open,
        trigger,
        closeModal,
        renameable,
        isNew,
        language,
        projectId,
        refreshBotResponse,
        name,
    } = props;

    const { upsertResponse } = useContext(ProjectContext); // using the upsert function from the project context ensures the visual story is updated
    const [createBotResponse] = useMutation(CREATE_BOT_RESPONSE);
    const [updateBotResponse] = useMutation(UPDATE_BOT_RESPONSE);
    const [deleteVariation] = useMutation(DELETE_VARIATION);
    
    const [newBotResponse, setNewBotResponse] = useState(botResponse);
    const [activeTab, setActiveTab] = useState(0);
    const [responseKey, setResponseKey] = useState(botResponse.key);
    const [renameError, setRenameError] = useState();

    useEffect(() => {
        setNewBotResponse(botResponse);
    }, [botResponse]);

    const validateResponseName = (err) => {
        if (!err) {
            setRenameError();
            return;
        }
        if (err.message.match(/E11000/)) {
            setRenameError('Response names must be unique');
        } else if (err.message.match(/alidation failed: key: Path `key` is invalid/)) {
            setRenameError('Response names must start with utter_');
        } else {
            setRenameError('an unexpected error occured while saving this response');
        }
    };

    const insertResponse = (newResponse, callback) => {
        createBotResponse({
            variables: {
                projectId,
                response: clearTypenameField(newResponse),
            },
        }).then(
            (result) => { callback(undefined, result); },
            (error) => { callback(error); },
        );
    };

    const updateResponse = (updatedResponse, callback) => {
        updateBotResponse({
            variables: {
                projectId, _id: updatedResponse._id, response: clearTypenameField(updatedResponse),
            },
        }).then(
            (result) => {
                callback(undefined, result);
            },
            (error) => {
                callback(error);
            },
        );
    };

    const handleDeleteVariation = (index) => {
        const activeIndex = newBotResponse.values.findIndex(({ lang }) => lang === language);
        
        const { sequence } = newBotResponse.values[activeIndex];
        const updatedSequence = [
            ...sequence.slice(0, index),
            ...sequence.slice(index + 1),
        ];
        
        const updatedBotResponse = { ...newBotResponse };
        updatedBotResponse.values[activeIndex].sequence = updatedSequence;
        if (isNew) {
            setNewBotResponse(updatedBotResponse);
            return;
        }
        const variables = {
            projectId,
            language,
            key: name || newBotResponse.key,
            index,
        };
        deleteVariation({ variables });
    };

    const handleChangeMetadata = (updatedMetadata) => {
        if (isNew) {
            setNewBotResponse(
                { ...newBotResponse, metadata: updatedMetadata },
            );
            return;
        }
        updateResponse({ ...newBotResponse, metadata: updatedMetadata }, () => {});
    };

    const handleChangeKey = async () => {
        if (isNew) {
            setNewBotResponse({ ...newBotResponse, key: responseKey });
            return;
        }
        updateResponse({ ...newBotResponse, key: responseKey }, validateResponseName);
    };

    const updateSequence = (oldResponse, content, index) => {
        const updatedResponse = { ...oldResponse };
        const activeIndex = oldResponse.values.findIndex(({ lang }) => lang === language);
        let { sequence } = updatedResponse.values[activeIndex];
        if (index !== undefined && sequence[index]) {
            sequence[index].content = content;
        } else {
            sequence = [...sequence, { content }];
        }
        updatedResponse.values[activeIndex].sequence = sequence;
        return updatedResponse;
    };

    const handleSequenceChange = (updatedSequence, index) => {
        const content = safeDump(updatedSequence);
        if (isNew) {
            const tempvar = updateSequence(newBotResponse, content, index);
            setNewBotResponse(tempvar);
            
            return;
        }
        upsertResponse(name || newBotResponse.key, updatedSequence, index);
    };

    const getActiveSequence = () => {
        const activeValue = newBotResponse.values && newBotResponse.values.find(({ lang }) => lang === language);
        if (!activeValue) {
            return addResponseLanguage(newBotResponse, language).values.find(({ lang }) => lang === language).sequence;
        }
        return activeValue.sequence;
    };

    const handleModalClose = () => {
        const validResponse = newBotResponse;
        if (!open) return;
        if ((!isNew || checkResponseEmpty(validResponse)) && !renameError) {
            const newPayload = addContentType(safeLoad(getActiveSequence()[0].content));
            upsertResponse(newBotResponse.key, newPayload, 0).then(() => {
                refreshBotResponse(`${language}-${name}`, addContentType(safeLoad(getActiveSequence()[0].content))); // refresh the content of the response in the visual story editor
                closeModal();
            });
            return;
        }
        if (isNew && !checkResponseEmpty(validResponse)) {
            insertResponse(validResponse, (err) => {
                validateResponseName(err);
                if (!err) {
                    closeModal();
                }
            });
        }
    };


    const addSequence = () => {
        const activeSequence = getActiveSequence();
        const template = getDefaultTemplateFromSequence(activeSequence);
        handleSequenceChange(template);
    };
   
    const renderActiveTab = () => {
        const activeSequence = getActiveSequence();
        if (activeTab === 1) {
            return <Segment attached><MetadataForm responseMetadata={newBotResponse.metadata} onChange={handleChangeMetadata} /></Segment>;
        }
        return (
            <SequenceEditor
                sequence={activeSequence}
                onChange={handleSequenceChange}
                onDeleteVariation={handleDeleteVariation}
            />
        );
    };
    return (
        <Modal
            className='response-editor-dimmer'
            trigger={trigger}
            content={(
                <Segment.Group className='response-editor' data-cy='response-editor'>
                    <Segment attached='top' className='resonse-editor-topbar'>
                        <div className='response-editor-topbar-section'>
                            <ResponseNameInput
                                renameable={renameable}
                                onChange={(e, target) => {
                                    setResponseKey(target.value);
                                }}
                                saveResponseName={handleChangeKey}
                                errorMessage={renameError}
                                responseName={responseKey}
                                disabledMessage='Responses used in a story cannot be renamed.'
                            />
                        </div>
                        <div className='response-editor-topbar-section'>
                            <Menu pointing secondary activeIndex={activeTab}>
                                <MenuItem onClick={() => { setActiveTab(0); }} active={activeTab === 0} className='response-variations' data-cy='variations-tab'>Response</MenuItem>
                                <MenuItem onClick={() => { setActiveTab(1); }} active={activeTab === 1} className='metadata' data-cy='metadata-tab'>Metadata</MenuItem>
                            </Menu>
                        </div>
                        <div className='response-editor-topbar-section' />
                    </Segment>
                    {renderActiveTab()}
                    <Segment attached='bottom' className='response-editor-footer' textAlign='center'>
                        <Button
                            className='add-sequence-button'
                            data-cy='add-sequence'
                            icon='plus'
                            onClick={addSequence}
                        />
                    </Segment>
                </Segment.Group>
            )}
            open
            onClose={handleModalClose}
            centered={false}
        />
    );
};

BotResponseEditor.propTypes = {
    botResponse: PropTypes.object,
    open: PropTypes.bool.isRequired,
    trigger: PropTypes.element.isRequired,
    closeModal: PropTypes.func.isRequired,
    renameable: PropTypes.bool,
    isNew: PropTypes.bool,
    language: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    refreshBotResponse: PropTypes.func,
    name: PropTypes.string,
};

BotResponseEditor.defaultProps = {
    botResponse: {},
    renameable: true,
    isNew: false,
    refreshBotResponse: () => {},
    name: null,
};

const BotResponseEditorWrapper = (props) => {
    const {
        botResponse: incomingBotResponse,
        trigger,
        projectId,
        name,
        isNew,
        open,
        responseType,
        language,
    } = props;

    const [botResponse, setBotResponse] = useState();

    if (name && !incomingBotResponse) {
        const {
            data,
            refetch,
        } = useQuery(GET_BOT_RESPONSE, {
            variables: { projectId, key: name },
        });

        useEffect(() => {
            if (data && data.botResponse) {
                setBotResponse(data.botResponse);
            }
            if (data && data.botResponse === null) {
                setBotResponse(createResponseFromTemplate('TextPayload', language, { key: name }));
            }
        }, [data]);

        useEffect(() => {
            refetch();
        }, []);

        useSubscription(RESPONSES_MODIFIED, {
            variables: { projectId },
            onSubscriptionData: ({ subscriptionData }) => {
                const resp = {
                    ...subscriptionData.data.botResponsesModified,
                };
                if (resp.name === name) { setBotResponse(resp); }
            },
        });
    }

    if (isNew && !incomingBotResponse && !botResponse) {
        setBotResponse(createResponseFromTemplate(responseType, language));
    }

    if ((!botResponse && !incomingBotResponse && !isNew) || !open) return trigger;
    return (
        <BotResponseEditor
            {...props}
            botResponse={botResponse || incomingBotResponse}
        />
    );
};

BotResponseEditorWrapper.propTypes = {
    botResponse: PropTypes.object,
    open: PropTypes.bool.isRequired,
    trigger: PropTypes.element.isRequired,
    closeModal: PropTypes.func.isRequired,
    renameable: PropTypes.bool,
    isNew: PropTypes.bool,
    responseType: PropTypes.string,
    language: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    refreshBotResponse: PropTypes.func,
    name: PropTypes.string,
};

BotResponseEditorWrapper.defaultProps = {
    botResponse: null,
    renameable: true,
    isNew: false,
    responseType: '',
    refreshBotResponse: () => {},
    name: null,
};

const mapStateToProps = state => ({
    language: state.settings.get('workingLanguage'),
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(BotResponseEditorWrapper);
