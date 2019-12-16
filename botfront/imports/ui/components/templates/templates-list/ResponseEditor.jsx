import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Dimmer, Segment, Input, Menu, MenuItem, Button, Tab,
} from 'semantic-ui-react';

import SequenceEditor from './SequenceEditor';
import MetadataForm from '../MetadataForm';

import { CREATE_BOT_RESPONSE, UPDATE_BOT_RESPONSE } from '../../../layouts/graphQL/mutations';
import { ProjectContext } from '../../../layouts/context';

const TemplatePopup = (props) => {
    const {
        botResponse,
        active,
    } = props;

    const [activeTab, setActiveTab] = useState(0);
    const [responseKey, setResponseKey] = useState(botResponse.key);
    const [metadata, setMetadata] = useState(botResponse.metadata);

    const { updateResponse, insertResponse, getResponse } = useContext(ProjectContext);
    const handleChangeMetadata = (updatedMetadata) => {
        setMetadata(updatedMetadata);
        updateResponse()({ ...botResponse, metadata }, () => {});
    };

    const handleChangeKey = (event, target) => {
        setResponseKey(target.value);
        updateResponse()({ ...botResponse, key: target.value });
    };

   
    const tabs = [
        <Segment attached='middle'><SequenceEditor botResponse={botResponse} /></Segment>,
        <Segment attached='middle'><MetadataForm responseMetadata={metadata} onChange={handleChangeMetadata} /></Segment>,
    ];
    return (
        <Dimmer className='response-editor-dimmer' active={active}>
            <Segment.Group className='response-editor'>
                <Segment attached='top' className='resonse-editor-topbar'>
                    <div className='response-editor-topbar-section'>
                        <Input className='response-name' placeholder='utter_response_name' value={responseKey} onChange={handleChangeKey} />
                    </div>
                    <div className='response-editor-topbar-section'>
                        <Menu basic pointing secondary activeIndex={activeTab}>
                            <MenuItem onClick={() => { setActiveTab(0); }} active={activeTab === 0} className='response-variations'>Response</MenuItem>
                            <MenuItem onClick={() => { setActiveTab(1); }} active={activeTab === 1} className='metadata'>Metadata</MenuItem>\
                        </Menu>
                    </div>
                    <div className='response-editor-topbar-section' />
                </Segment>
                {tabs[activeTab]}
                {/* <Segment attached='bottom'>
                    <Button icon='plus' />
                </Segment> */}
            </Segment.Group>
        </Dimmer>
    );
};

export default TemplatePopup;
