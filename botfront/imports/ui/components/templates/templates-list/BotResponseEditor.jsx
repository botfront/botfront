import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';

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
    } = props;
    if (!open) return trigger;
    const botResponse = isNew ? createResponseFromTemplate(responseType) : incomingBotResponse;

    const [activeTab, setActiveTab] = useState(0);
    const [responseKey, setResponseKey] = useState(botResponse.key);
    const [renameError, setRenameError] = useState();

    const { updateResponse, insertResponse } = useContext(ProjectContext);
    const handleChangeMetadata = (updatedMetadata) => {
        if (isNew) return;
        updateResponse({ ...botResponse, metadata: updatedMetadata }, () => {});
    };

    const handleChangeKey = async () => {
        if (isNew) return;
        if (!responseKey.match(/^utter_/)) return;
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

   
    const tabs = [
        <Segment attached='middle'><SequenceEditor botResponse={botResponse} /></Segment>,
        <Segment attached='middle'><MetadataForm responseMetadata={botResponse.metadata} onChange={handleChangeMetadata} /></Segment>,
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
                    <Menu basic pointing secondary activeIndex={activeTab}>
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

    const handleModalClose = () => {
        if (!open) return;
        if (isNew && !checkResponseEmpty(botResponse)) {
            insertResponse(botResponse, (err) => {
                if (!err) {
                    console.log('created');
                }
            });
        }
        closeModal();
    };
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
};

BotResponseEditor.defaultProps = {
    incomingBotResponse: {},
    renameable: true,
    isNew: false,
    responseType: '',
};

export default BotResponseEditor;
