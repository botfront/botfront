import React, { useState, useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { safeDump, safeLoad } from 'js-yaml';
import { useMutation, useSubscription, useQuery } from '@apollo/react-hooks';
import {
    Segment, Menu, MenuItem, Modal, Button,
} from 'semantic-ui-react';
// connections
import { UPSERT__FULL_BOT_RESPONSE, DELETE_VARIATION } from '../mutations';
import { RESPONSES_MODIFIED } from './subscriptions';
import { GET_BOT_RESPONSE } from '../queries';
// components
import { ProjectContext } from '../../../layouts/context';
import { ConversationOptionsContext } from '../../stories/Context';
import SequenceEditor from './SequenceEditor';
import MetadataForm from '../MetadataForm.ce';
import ResponseNameInput from '../common/ResponseNameInput';
// utils
import {
    createResponseFromTemplate,
    checkResponseEmpty,
    addResponseLanguage,
    getDefaultTemplateFromSequence,
    addContentType,
    modifyResponseType,
    generateRenamingErrorMessage,
} from '../../../../lib/botResponse.utils';
import { clearTypenameField } from '../../../../lib/client.safe.utils';
import { Loading } from '../../utils/Utils';


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
        isNew,
        language,
        projectId,
        name,
    } = props;

    const { resetResponseInCache, setResponseInCache } = useContext(ProjectContext); // using the upsert function from the project context ensures the visual story is updated
    const { reloadStories } = useContext(ConversationOptionsContext);
    const [upsertWholeBotResponse] = useMutation(UPSERT__FULL_BOT_RESPONSE);
    const [deleteVariation] = useMutation(DELETE_VARIATION);
    
    const [newBotResponse, setNewBotResponse] = useState(botResponse);
    const [activeTab, setActiveTab] = useState(0);
    const [responseKey, setResponseKey] = useState(name);
    const [renameError, setRenameError] = useState();
    const [triggerClose, setTriggerClose] = useState(false);

    useEffect(() => {
        if (botResponse) {
            setNewBotResponse(botResponse);
        }
    }, [botResponse]);

    const validateResponseName = (err) => {
        const newRenameError = generateRenamingErrorMessage(err);
        setRenameError(newRenameError);
        return newRenameError;
    };

    const upsertFullResponse = (updatedResponse, callback = () => {}) => {
        upsertWholeBotResponse({
            variables: {
                projectId, _id: updatedResponse._id, response: clearTypenameField(updatedResponse), ...(isNew ? {} : { key: newBotResponse.key }),
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
            key: responseKey,
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
        upsertFullResponse({ ...newBotResponse, metadata: updatedMetadata }, () => {});
    };

    const handleChangeKey = async () => {
        if (isNew) {
            setNewBotResponse({ ...newBotResponse, key: responseKey });
            return;
        }
        upsertFullResponse({ ...newBotResponse, key: responseKey }, validateResponseName);
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
        const { payload: { metadata, ...content } } = updatedSequence;
        const updatedBotResponse = updateSequence(newBotResponse, content, index);
        if (isNew) {
            setNewBotResponse(updatedBotResponse);
            return;
        }
        upsertFullResponse(updatedBotResponse);
    };

    const handleChangePayloadType = (newType) => {
        const updatedBotResponse = modifyResponseType(newBotResponse, newType);
        if (isNew || !newBotResponse._id) {
            setNewBotResponse(updatedBotResponse);
            return;
        }
        upsertFullResponse(updatedBotResponse);
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

    const handleModalClose = async () => {
        if (!open) return false;
        // the response is new or
        // the response was one of the default defined one and thus does not really exist in db
        if (isNew || newBotResponse._id === undefined) {
            if (checkResponseEmpty(newBotResponse)) return closeModal();
            return upsertFullResponse(newBotResponse, (err) => {
                validateResponseName(err);
                if (!err) {
                    closeModal();
                }
            });
        } if (!renameError) {
            return resetResponseInCache(name).then(() => {
                if (name !== responseKey) {
                    setResponseInCache(responseKey, getRefreshData());
                    reloadStories();
                } else closeModal();
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
        handleSequenceChange({ payload: template });
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
                />
                <Segment attached='bottom' className='response-editor-footer' textAlign='center'>
                    <Button
                        className='add-variation-button'
                        data-cy='add-variation'
                        icon='plus'
                        onClick={addSequence}
                    />
                </Segment>
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
                            renameable
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
            onClose={() => setTriggerClose(true)} // closes the modal the next time it renders using useEffect
            centered={false}
        />
    );
};

BotResponseEditor.propTypes = {
    botResponse: PropTypes.object,
    open: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    isNew: PropTypes.bool,
    language: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    name: PropTypes.string,
};

BotResponseEditor.defaultProps = {
    botResponse: {},
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
