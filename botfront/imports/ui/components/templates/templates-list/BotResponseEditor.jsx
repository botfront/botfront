import React, { useState, useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { safeDump } from 'js-yaml';
import { useMutation, useSubscription, useQuery } from '@apollo/react-hooks';
import {
    Segment, Input, Menu, MenuItem, Modal, Popup, Icon,
} from 'semantic-ui-react';
// connections
import { CREATE_BOT_RESPONSE, UPDATE_BOT_RESPONSE } from '../mutations';
import { RESPONSES_MODIFIED } from './subscriptions';
import { GET_BOT_RESPONSE } from '../queries';
// components
import { ProjectContext } from '../../../layouts/context';
import SequenceEditor from './SequenceEditor';
import MetadataForm from '../MetadataForm';
// utils
import { createResponseFromTemplate, checkResponseEmpty } from '../botResponse.utils';
import { clearTypenameField } from '../../../../lib/utils';

const BotResponseEditor = (props) => {
    const {
        incomingBotResponse,
        open,
        trigger,
        closeModal,
        renameable,
        isNew,
        responseType,
        language,
        projectId,
        refreshBotResponse,
        name,
    } = props;
    if (!open) return trigger;
    const botResponse = isNew ? createResponseFromTemplate(responseType) : incomingBotResponse;

    const { upsertResponse } = useContext(ProjectContext);
    
    const [newBotResponse, setNewBotResponse] = useState();
    const [activeTab, setActiveTab] = useState(0);
    const [responseKey, setResponseKey] = useState(botResponse.key);
    const [renameError, setRenameError] = useState();

    const [createBotResponse] = useMutation(CREATE_BOT_RESPONSE);
    const [updateBotResponse] = useMutation(UPDATE_BOT_RESPONSE);

    const insertResponse = (newResponse, callback) => {
        createBotResponse({ variables: { projectId, response: clearTypenameField(newResponse) } }).then(
            (result) => {
                callback(undefined, result);
            },
            (error) => {
                callback(error);
            },
        );
    };

    const updateResponse = (updatedResponse, callback) => {
        updateBotResponse({
            variables: {
                projectId, _id: updatedResponse._id, key: updatedResponse.key, response: clearTypenameField(updatedResponse),
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

    const handleChangeMetadata = (updatedMetadata) => {
        if (isNew) {
            setNewBotResponse({ ...(newBotResponse || botResponse), metadata: updatedMetadata });
            return;
        }
        updateResponse({ ...botResponse, metadata: updatedMetadata }, () => {});
    };

    const handleChangeKey = async () => {
        if (!responseKey.match(/^utter_/)) return;
        if (isNew) {
            setNewBotResponse({ ...(newBotResponse || botResponse), key: responseKey });
            return;
        }
        updateResponse({ ...botResponse, key: responseKey }, (error) => {
            if (error) {
                if (error.message.match(/E11000/)) {
                    setRenameError('Response names must be unique');
                    return;
                }
                setRenameError('There was an error saving your response');
            }
            setRenameError();
        });
    };

    const updateSequence = (oldResponse, content) => {
        const updatedResponse = oldResponse;
        const activeIndex = oldResponse.values.findIndex(({ lang }) => lang === language);
        updatedResponse.values[activeIndex].sequence[0].content = content;
        return updatedResponse;
    };

    const handleSequenceChange = (updatedSequence) => {
        const content = safeDump(updatedSequence);
        if (isNew) {
            setNewBotResponse(updateSequence(newBotResponse || botResponse, content));
            return;
        }
        upsertResponse(name || responseKey, updatedSequence).then((error, result) => {
            if (error) {
                console.log(error);
            }
        });
    };

    const handleModalClose = () => {
        const validResponse = newBotResponse || botResponse;
        if (!open) return;
        if (isNew && !checkResponseEmpty(validResponse)) {
            insertResponse(validResponse, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        }
        refreshBotResponse(name);
        closeModal();
    };

    const getActiveValue = () => {
        const activeValue = botResponse.values && botResponse.values.find(({ lang }) => lang === language);
        if (!activeValue) {
            createResponseFromTemplate();
        }
        return activeValue.sequence;
    };
   
    const tabs = [
        (
            <Segment attached>
                <SequenceEditor
                    sequence={getActiveValue()}
                    onChange={handleSequenceChange}
                />
            </Segment>
        ),
        <Segment attached><MetadataForm responseMetadata={botResponse.metadata} onChange={handleChangeMetadata} /></Segment>,
    ];

    const renderContent = () => (
        <Segment.Group className='response-editor' data-cy='response-editor'>
            <Segment attached='top' className='resonse-editor-topbar'>
                <div className='response-editor-topbar-section'>
                    <Popup
                        inverted
                        disabled={renameable}
                        trigger={(
                            // disabling the trigger of a popup prevents it from appearing,
                            // wrapping the trigger in a div allows it to show while the input is disabled
                            <div>
                                <Input
                                    className='response-name'
                                    placeholder='utter_response_name'
                                    value={responseKey}
                                    onChange={(e, target) => setResponseKey(target.value)}
                                    onBlur={handleChangeKey}
                                    disabled={!renameable}
                                    error={renameError}
                                    data-cy='response-name-input'
                                />
                                {renameError && (
                                    <Popup
                                        trigger={<Icon name='exclamation circle' color='red' />}
                                        // inverted
                                        content={renameError}
                                        // content='Response names must be unique.'
                                    />
                                )}
                            </div>
                        )}
                        content='Responses used in a story cannot be renamed.'
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
            {tabs[activeTab]}
            {/* <Segment attached='bottom'>
                    <Button icon='plus' />
                </Segment> */}
        </Segment.Group>
    );


    return (
        <Modal
            className='response-editor-dimmer'
            trigger={trigger}
            content={renderContent()}
            open
            onClose={handleModalClose}
            centered={false}
        />
    );
};

BotResponseEditor.propTypes = {
    incomingBotResponse: PropTypes.object,
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

BotResponseEditor.defaultProps = {
    incomingBotResponse: {},
    renameable: true,
    isNew: false,
    responseType: '',
    refreshBotResponse: () => {},
    name: null,
};

const BotResponseEditorWrapper = (props) => {
    const {
        incomingBotResponse, open, trigger, projectId, name, isNew,
    } = props;
    

    const [botResponse, setBotResponse] = useState();
    const [loading, setLoading] = useState(true);

    if (name) {
        const {
            loading: queryLoading, error, data, refetch,
        } = useQuery(GET_BOT_RESPONSE, {
            variables: { projectId, key: name },
        });
        useEffect(() => {
            if (data && data.botResponse) {
                setBotResponse(data.botResponse);
            }
        }, [data]);
        useSubscription(RESPONSES_MODIFIED, {
            variables: { projectId },
            onSubscriptionData: ({ subscriptionData }) => {
                if (!loading) {
                    // const newBotResponse = { ...botResponse };
                    const resp = { ...subscriptionData.data.botResponsesModified };
                    if (resp.name === name) { setBotResponse(resp); }
                }
            },
        });
    }
    if (!botResponse && !incomingBotResponse && !isNew) return trigger;
    return (
        <BotResponseEditor
            {...props}
            incomingBotResponse={botResponse || incomingBotResponse}
        />
    );
};

BotResponseEditorWrapper.propTypes = {
    incomingBotResponse: PropTypes.object,
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
    incomingBotResponse: null,
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
