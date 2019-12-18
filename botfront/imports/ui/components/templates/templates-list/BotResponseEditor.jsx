import React, { useState, useContext } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { safeDump } from 'js-yaml';

import {
    Segment, Input, Menu, MenuItem, Modal, Popup, Icon,
} from 'semantic-ui-react';

import SequenceEditor from './SequenceEditor';
import MetadataForm from '../MetadataForm';
import { ProjectContext } from '../../../layouts/context';

import { createResponseFromTemplate, checkResponseEmpty } from '../botResponse.utils';

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
    } = props;
    if (!open) return trigger;
    const botResponse = isNew ? createResponseFromTemplate(responseType) : incomingBotResponse;
    
    const [newBotResponse, setNewBotResponse] = useState();
    const [activeTab, setActiveTab] = useState(0);
    const [responseKey, setResponseKey] = useState(botResponse.key);
    const [renameError, setRenameError] = useState();

    const { updateResponse, insertResponse } = useContext(ProjectContext);
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
        updateResponse(updateSequence(botResponse, content), (error) => {
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
        closeModal();
    };
   
    const tabs = [
        (
            <Segment attached>
                <SequenceEditor
                    sequence={botResponse.values.find(({ lang }) => lang === language).sequence}
                    onChange={handleSequenceChange}
                />
            </Segment>
        ),
        <Segment attached><MetadataForm responseMetadata={botResponse.metadata} onChange={handleChangeMetadata} /></Segment>,
    ];

    const renderContent = () => (
        <Segment.Group className='response-editor'>
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
                        <MenuItem onClick={() => { setActiveTab(0); }} active={activeTab === 0} className='response-variations'>Response</MenuItem>
                        <MenuItem onClick={() => { setActiveTab(1); }} active={activeTab === 1} className='metadata'>Metadata</MenuItem>
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
};

BotResponseEditor.defaultProps = {
    incomingBotResponse: {},
    renameable: true,
    isNew: false,
    responseType: '',
};

const mapStateToProps = state => ({
    language: state.settings.get('workingLanguage'),
});

export default connect(mapStateToProps)(BotResponseEditor);
