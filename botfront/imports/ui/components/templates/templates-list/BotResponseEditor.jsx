import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';

import {
    Segment, Input, Menu, MenuItem, Modal, Popup, Icon,
} from 'semantic-ui-react';

import SequenceEditor from './SequenceEditor';
import MetadataForm from '../MetadataForm';
import { ProjectContext } from '../../../layouts/context';

const BotResponseEditor = (props) => {
    const {
        botResponse,
        open,
        trigger,
        closeModal,
        renameable,
    } = props;

    if (!open) return trigger;

    const [activeTab, setActiveTab] = useState(0);
    const [responseKey, setResponseKey] = useState(botResponse.key);
    const [renameError, setRenameError] = useState();

    const { updateResponse } = useContext(ProjectContext);
    const handleChangeMetadata = (updatedMetadata) => {
        updateResponse({ ...botResponse, metadata: updatedMetadata }, () => {});
    };

    const handleChangeKey = async () => {
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
    return (
        <Modal
            className='response-editor-dimmer'
            trigger={trigger}
            content={renderContent()}
            open
            onClose={() => { if (open) closeModal(); }}
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
};

BotResponseEditor.defaultProps = {
    botResponse: {},
    renameable: true,
};

export default BotResponseEditor;
