import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Segment, Popup } from 'semantic-ui-react';


import StoryRulesForm from './StoryRulesForm';

const StoryRulesEditor = (props) => {
    const [localOpen, setLocalOpen] = useState(false);

    const {
        trigger,
        storyId,
        projectId,
        rules: incommingRules,
        open = localOpen,
        setOpen = setLocalOpen,
        isDestinationStory,
    } = props;

    const [rules, setRules] = useState({ rules: incommingRules });

    useEffect(() => {
        setRules({ rules: incommingRules });
    }, [incommingRules]);

    const modalTrigger = { // customize onClick, disabled, and className of the trigger element
        ...trigger,
        props: {
            ...trigger.props,
            className: `${trigger.props.className || ''} trigger-editor-modal-trigger`,
            onClick: (...args) => {
                setOpen(true);
                if (!trigger.props.onClick) return undefined;
                return trigger.props.onClick(...args);
            },
            disabled: isDestinationStory,
        },
    };

    const clearOptionalFields = (model) => {
        const newModel = model;
        Object.keys(model).forEach((key) => {
            if (key.match(/__DISPLAYIF$/) && !model[key]) {
                const dataKey = key.substring(0, key.length - 11);
                delete newModel[dataKey];
                return;
            }
            if (typeof newModel[key] === 'object') {
                clearOptionalFields(newModel[key]);
            }
        });
        return newModel;
    };

    const handleChangeRules = (model) => {
        setRules(model);
    };

    const handleModalClose = () => {
        Meteor.call('stories.updateRules', projectId, storyId, clearOptionalFields(rules), (err) => {
            if (err) return;
            setOpen(false);
        });
    };

    return (
        <Popup
            trigger={(
                <div>
                    <Modal
                        trigger={modalTrigger}
                        onClose={handleModalClose}
                        open={open}
                    >
                        <Segment.Group>
                            <Segment>
                                <StoryRulesForm
                                    onChange={handleChangeRules}
                                    rules={rules}
                                    saveAndExit={handleModalClose}
                                />
                            </Segment>
                        </Segment.Group>
                    </Modal>
                </div>
            )}
            content='You must remove the links to this story to add triggers'
            disabled={!isDestinationStory}
        />
    );
};

StoryRulesEditor.propTypes = {
    trigger: PropTypes.element.isRequired, // the trigger element will have it's onClick and className props modified
    storyId: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    rules: PropTypes.array,
    open: PropTypes.bool,
    setOpen: PropTypes.func,
    isDestinationStory: PropTypes.bool.isRequired,
};

StoryRulesEditor.defaultProps = {
    rules: [],
    open: null,
    setOpen: null,
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(StoryRulesEditor);
