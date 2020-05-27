import React, { useState, useContext, useEffect } from 'react';
import shortid from 'shortid';
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
import MetadataForm from '../MetadataForm.gke';
import ResponseNameInput from '../common/ResponseNameInput';
// utils
import {
    createResponseFromTemplate,
    checkResponseEmpty,
    addResponseLanguage,
    getDefaultTemplateFromSequence,
    addContentType,
    modifyResponseType,
} from '../../../../lib/botResponse.utils';
import { clearTypenameField } from '../../../../lib/client.safe.utils';
import { Loading } from '../../utils/Utils';
import { can } from '../../../../lib/scopes';


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
        closeModal,
        renameable,
        isNew,
        language,
        projectId,
        name,
    } = props;

    const { upsertResponse } = useContext(ProjectContext); // using the upsert function from the project context ensures the visual story is updated
    const [createBotResponse] = useMutation(CREATE_BOT_RESPONSE);
    const [updateBotResponse] = useMutation(UPDATE_BOT_RESPONSE);
    const [deleteVariation] = useMutation(DELETE_VARIATION);
    
    const [newBotResponse, setNewBotResponse] = useState(botResponse);
    const [activeTab, setActiveTab] = useState(0);
    const [responseKey, setResponseKey] = useState(name);
    const [renameError, setRenameError] = useState();
    const [triggerClose, setTriggerClose] = useState(false);

    useEffect(() => {
        if (botResponse) {
            setNewBotResponse(botResponse);
            setResponseKey(botResponse.key);
        }
    }, [botResponse]);

    const editable = can('responses:w', projectId);

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
        const key = newResponse.key === 'utter_'
            ? `utter_${shortid.generate()}`
            : newResponse.key;
        createBotResponse({
            variables: {
                projectId,
                response: clearTypenameField({ ...newResponse, key }),
            },
        }).then(
            (result) => { callback(undefined, result); },
            (error) => { callback(error); },
        );
    };

    const updateResponse = (updatedResponse, callback = () => {}) => {
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
            key: name,
            index,
        };
        deleteVariation({ variables });
    };

    const handleChangeMetadata = (updatedMetadata) => {
        if (isNew || !newBotResponse._id) {
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

    const updateSequence = (oldResponse, contentInput, index) => {
        const updatedResponse = { ...oldResponse };
        const activeIndex = oldResponse.values.findIndex(({ lang }) => lang === language);
        let { sequence } = updatedResponse.values[activeIndex];
        const content = typeof contentInput === 'string'
            ? contentInput : safeDump(contentInput);
        if (index !== undefined && sequence[index]) {
            sequence[index].content = content;
        } else {
            sequence = [...sequence, { content }];
        }
        updatedResponse.values[activeIndex].sequence = sequence;
        return updatedResponse;
    };

    const handleSequenceChange = (updatedSequence, index) => {
        const { metadata, ...content } = updatedSequence;
        if (isNew) {
            const tempvar = updateSequence(newBotResponse, content, index);
            setNewBotResponse(tempvar);

            return;
        }
        upsertResponse(name, updatedSequence, index);
    };

    const handleChangePayloadType = (newType) => {
        const updatedBotResponse = modifyResponseType(newBotResponse, newType);
        if (isNew || !newBotResponse._id) {
            setNewBotResponse(updatedBotResponse);
            return;
        }
        updateResponse(updatedBotResponse);
    };

    const getActiveSequence = () => {
        const activeValue = newBotResponse.values && newBotResponse.values.find(({ lang }) => lang === language);
        if (!activeValue) {
            return addResponseLanguage(newBotResponse, language).values.find(({ lang }) => lang === language).sequence;
        }
        return activeValue.sequence;
    };

    const getRefreshData = () => {
        const ret = addContentType(safeLoad(getActiveSequence()[0].content));
        const { metadata } = newBotResponse;
        return { ...ret, metadata };
    };

    const handleModalClose = () => {
        const validResponse = newBotResponse;
        if (!open) return false;
        // the response is new or
        // the response was one of the default defined one and thus does not really exist in db
        if (isNew || validResponse._id === undefined) {
            if (checkResponseEmpty(validResponse)) return closeModal();
            return insertResponse(validResponse, (err) => {
                validateResponseName(err);
                if (!err) {
                    closeModal();
                }
            });
        } if (!renameError) {
            const newPayload = getRefreshData();
            return upsertResponse(name, newPayload, 0, false).then(() => { // update the content of the first variation to ensure consistency in visual story editor
                closeModal();
            });
        }
        return false;
    };

    useEffect(() => {
        if (triggerClose === true) {
            // allows focused content to blur and save before closing the modal
            handleModalClose();
            setTriggerClose(false);
        }
    }, [triggerClose]);

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
            <>
                <SequenceEditor
                    sequence={activeSequence}
                    onChange={handleSequenceChange}
                    onDeleteVariation={handleDeleteVariation}
                    onChangePayloadType={handleChangePayloadType}
                    name={name}
                    editable={editable}
                />
                {editable && (
                    <Segment attached='bottom' className='response-editor-footer' textAlign='center'>
                        <Button
                            className='add-variation-button'
                            data-cy='add-variation'
                            icon='plus'
                            onClick={addSequence}
                        />
                    </Segment>
                )}
            </>
        );
    };

    const renderModalContent = () => {
        if (!newBotResponse) return <Loading loading />;
        return (
            <Segment.Group className='response-editor' data-cy='response-editor'>
                <Segment attached='top' className='resonse-editor-topbar'>
                    <div className='response-editor-topbar-section'>
                        <ResponseNameInput
                            className={editable ? '' : 'read-only'}
                            renameable={renameable}
                            onChange={(_e, target) => setResponseKey(target.value)}
                            saveResponseName={handleChangeKey}
                            errorMessage={renameError}
                            responseName={responseKey}
                            disabledMessage='Responses used in a story cannot be renamed.'
                        />
                    </div>
                    <div className='response-editor-topbar-section'>
                        <Menu pointing secondary activeIndex={activeTab}>
                            <MenuItem onClick={() => { setActiveTab(0); }} active={activeTab === 0} className='response-variations' data-cy='variations-tab'>Variations</MenuItem>
                            <MenuItem onClick={() => { setActiveTab(1); }} active={activeTab === 1} className='metadata' data-cy='metadata-tab'>Behaviour</MenuItem>
                        </Menu>
                    </div>
                    <div className='response-editor-topbar-section' />
                </Segment>
                {renderActiveTab()}

            </Segment.Group>
        );
    };

    return (
        <Modal
            className='response-editor-dimmer'
            content={renderModalContent()}
            open={open}
            onClose={() => {
                if (can('responses:w', projectId)) {
                    setTriggerClose(true);
                    return;
                }
                closeModal();
            }} // closes the modal the next time it renders using useEffect
            centered={false}
        />
    );
};

BotResponseEditor.propTypes = {
    botResponse: PropTypes.object,
    open: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    renameable: PropTypes.bool,
    isNew: PropTypes.bool,
    language: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    name: PropTypes.string,
};

BotResponseEditor.defaultProps = {
    botResponse: {},
    renameable: true,
    isNew: false,
    name: null,
};

const BotResponseEditorWrapper = (props) => {
    const {
        botResponse: incomingBotResponse,
        projectId,
        name,
        isNew,
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
                if (resp.key === name) { setBotResponse(resp); }
            },
        });
    }

    const KEY = 'utter_';
    if (isNew && !incomingBotResponse && !botResponse) {
        setBotResponse(createResponseFromTemplate(responseType, language, { key: KEY }));
    }

    const key = name || (incomingBotResponse
        ? incomingBotResponse.key : KEY);

    return (
        <BotResponseEditor
            {...props}
            name={key}
            botResponse={botResponse || incomingBotResponse}
        />
    );
};

BotResponseEditorWrapper.propTypes = {
    botResponse: PropTypes.object,
    open: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    renameable: PropTypes.bool,
    isNew: PropTypes.bool,
    responseType: PropTypes.string,
    language: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    name: PropTypes.string,
};

BotResponseEditorWrapper.defaultProps = {
    botResponse: null,
    renameable: true,
    isNew: false,
    responseType: '',
    name: null,
};

const mapStateToProps = state => ({
    language: state.settings.get('workingLanguage'),
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(BotResponseEditorWrapper);
