import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Segment } from 'semantic-ui-react';


import StoryTriggersForm from '../chat_rules/StoryTriggersForm';

const StoryTriggerEditor = (props) => {
    const [localOpen, setLocalOpen] = useState(false);

    const {
        trigger,
        storyId,
        projectId,
        triggers: incommingTriggers,
        open = localOpen,
        setOpen = setLocalOpen,
    } = props;

    const [triggers, setTriggers] = useState({ triggers: incommingTriggers });

    const modalTrigger = { // customize onClick and className of the trigger element
        ...trigger,
        props: {
            ...trigger.props,
            className: `${trigger.props.className || ''} trigger-editor-modal-trigger`,
            onClick: (...args) => {
                setOpen(true);
                if (!trigger.props.onClick) return undefined;
                return trigger.props.onClick(...args);
            },
        },
    };
    
    const handleChangeTriggers = (model) => {
        setTriggers(model);
    };

    const handleModalClose = () => {
        Meteor.call('stories.updateTriggers', projectId, storyId, triggers, (err) => {
            if (err) return;
            setOpen(false);
        });
    };


    return (
        <Modal
            trigger={modalTrigger}
            onClose={handleModalClose}
            open={open}
        >
            <Segment.Group>
                <Segment>
                    <StoryTriggersForm onChange={handleChangeTriggers} storyTriggers={triggers} saveAndExit={handleModalClose} />
                </Segment>
            </Segment.Group>
        </Modal>
    );
};

StoryTriggerEditor.propTypes = {
    trigger: PropTypes.element.isRequired, // the trigger element will have it's onClick and className props modified
    storyId: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    triggers: PropTypes.array,
    open: PropTypes.bool,
    setOpen: PropTypes.func,
};

StoryTriggerEditor.defaultProps = {
    triggers: [],
    open: null,
    setOpen: null,
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(StoryTriggerEditor);
