import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Segment } from 'semantic-ui-react';


import StoryTriggersForm from '../chat_rules/StoryRulesForm';

const StoryTriggerEditor = (props) => {
    const [localOpen, setLocalOpen] = useState(false);

    const {
        trigger,
        storyId,
        projectId,
        triggerRules: incommingRules,
        open = localOpen,
        setOpen = setLocalOpen,
    } = props;

    const [triggerRules, setTriggerRules] = useState({ triggers: incommingRules });

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

    const traverseTriggers = (model) => {
        const newModel = model;
        Object.keys(model).forEach((key) => {
            if (key.match(/__DISPLAYIF$/) && !model[key]) {
                const dataKey = key.substring(0, key.length - 11);
                delete newModel[dataKey];
                return;
            }
            if (typeof newModel[key] === 'object') {
                traverseTriggers(newModel[key]);
            }
        });
        return newModel;
    };

    const handleChangeRules = (model) => {
        setTriggerRules(model);
    };

    const handleModalClose = () => {
        Meteor.call('stories.updateTriggers', projectId, storyId, traverseTriggers(triggerRules), (err) => {
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
                    <StoryTriggersForm onChange={handleChangeRules} triggerRules={triggerRules} saveAndExit={handleModalClose} />
                </Segment>
            </Segment.Group>
        </Modal>
    );
};

StoryTriggerEditor.propTypes = {
    trigger: PropTypes.element.isRequired, // the trigger element will have it's onClick and className props modified
    storyId: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    triggerRules: PropTypes.array,
    open: PropTypes.bool,
    setOpen: PropTypes.func,
};

StoryTriggerEditor.defaultProps = {
    triggerRules: [],
    open: null,
    setOpen: null,
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(StoryTriggerEditor);
