import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Segment } from 'semantic-ui-react';


import StoryTriggersForm from '../chat_rules/StoryTriggersForm';

const StoryTriggerEditor = (props) => {
    const {
        trigger,
        storyId,
        projectId,
        triggers: incommingTriggers,
    } = props;

    const [triggers, setTriggers] = useState({ triggers: incommingTriggers });

    const handleChangeTriggers = (model) => {
        setTriggers(model);
    };

    const handleModalClose = () => {
        Meteor.call('stories.updateTriggers', projectId, storyId, triggers);
    };

    return (
        <Modal
            trigger={trigger}
            onClose={handleModalClose}
        >
            <Segment.Group>
                <Segment>
                    <StoryTriggersForm onChange={handleChangeTriggers} storyTriggers={triggers} />
                </Segment>
            </Segment.Group>
        </Modal>
    );
};

StoryTriggerEditor.propTypes = {
    trigger: PropTypes.element.isRequired,
    storyId: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    triggers: PropTypes.array,
};

StoryTriggerEditor.defaultProps = {
    triggers: [],
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(StoryTriggerEditor);
