import { Modal, Popup, Icon } from 'semantic-ui-react';
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Alert from 'react-s-alert';

import StoryRulesForm from './StoryRulesForm';

import { can } from '../../../../lib/scopes';

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
            disabled: trigger.props.disabled || isDestinationStory || !can('triggers:r', projectId),
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

    const handleOnSave = (model) => {
        setRules(model);
        Meteor.call('stories.updateRules', projectId, storyId, clearOptionalFields(model), (err) => {
            if (err) {
                Alert.error(`Error: the rules could not be saved: ${err}`);
                return;
            }
            setOpen(false);
        });
    };

    const deleteTriggers = () => {
        Meteor.call('stories.deleteRules', projectId, storyId, (err) => {
            if (err) {
                Alert.error(`Error: the rules could not be deleted: ${err}`);
                return;
            }
            setOpen(false);
        });
    };

    const handleCancelChanges = () => {
        setRules({ rules: incommingRules });
        setOpen(false);
    };

    return (
        <Popup
            trigger={(
                <div>
                    <Modal
                        trigger={modalTrigger}
                        onClose={() => {}}
                        open={open}
                    >
                        <Modal.Header>
                            Triggers
                            <Icon name='close' onClick={handleCancelChanges} className='close-rules-editor' link />
                        </Modal.Header>
                        <Modal.Content className={can('triggers:w', projectId) ? '' : 'read-only'}>
                            <StoryRulesForm
                                onChange={handleChangeRules}
                                rules={rules}
                                onSave={handleOnSave}
                                deleteTriggers={deleteTriggers}
                                projectId={projectId}
                            />
                        </Modal.Content>
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
