import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';

import {
    Segment, Input, Menu, MenuItem, Modal,
} from 'semantic-ui-react';

import SequenceEditor from './SequenceEditor';
import MetadataForm from '../MetadataForm';
import { ProjectContext } from '../../../layouts/context';

const ResponseEditor = (props) => {
    const {
        botResponse,
        open,
        trigger,
        closeModal,
    } = props;

    if (!open) return trigger;

    const [activeTab, setActiveTab] = useState(0);
    const [responseKey, setResponseKey] = useState(botResponse.key);
    const [metadata, setMetadata] = useState(botResponse.metadata);

    const { updateResponse } = useContext(ProjectContext);
    const handleChangeMetadata = (updatedMetadata) => {
        setMetadata(updatedMetadata);
        updateResponse({ ...botResponse, metadata: updatedMetadata }, () => {});
    };

    const handleChangeKey = () => {
        if (!responseKey.match(/^utter_/)) return;
        updateResponse({ ...botResponse, key: responseKey });
    };

   
    const tabs = [
        <Segment attached='middle'><SequenceEditor botResponse={botResponse} /></Segment>,
        <Segment attached='middle'><MetadataForm responseMetadata={metadata} onChange={handleChangeMetadata} /></Segment>,
    ];

    const renderContent = () => (
        <Segment.Group className='response-editor'>
            <Segment attached='top' className='resonse-editor-topbar'>
                <div className='response-editor-topbar-section'>
                    <Input
                        className='response-name'
                        placeholder='utter_response_name'
                        value={responseKey}
                        onChange={(e, target) => setResponseKey(target.value)}
                        onBlur={handleChangeKey}
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

ResponseEditor.propTypes = {
    botResponse: PropTypes.object,
    open: PropTypes.bool.isRequired,
    trigger: PropTypes.element.isRequired,
    closeModal: PropTypes.func.isRequired,
};

ResponseEditor.defaultProps = {
    botResponse: {},
};

export default ResponseEditor;
