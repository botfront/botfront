import {
    Popup, Icon, Menu, Label, Message, Checkbox, Header, List,
} from 'semantic-ui-react';
import { connect } from 'react-redux';
import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import 'brace/theme/github';
import 'brace/mode/text';
import StoryPlayButton from './StoryPlayButton';
import ConfirmPopup from '../common/ConfirmPopup';
import { setStoryCollapsed } from '../../store/actions/actions';
import StoryVisualEditor from './common/StoryVisualEditor';
import { ConversationOptionsContext } from './Context';
import StoryRulesEditor from './rules/StoryRulesEditor';
import { can } from '../../../lib/scopes';

const StoryTopMenu = ({
    fragment,
    collapsed,
    collapseStory,
    warnings,
    errors,
    storyMode,
    renderAceEditor,
    projectId,
}) => {
    const {
        type,
        _id,
        title,
        checkpoints,
        rules = [],
        condition = [],
        conversation_start: convStart,
        status,
    } = fragment;
    const [newTitle, setNewTitle] = useState(title);
    const [triggerEditorOpen, setTriggerEditorOpen] = useState(false);
    const [confirmPopupOpen, setConfirmPopupOpen] = useState(false);

    useEffect(() => setNewTitle(title), [title]);

    const {
        stories, updateStory, getResponseLocations, linkToStory,
    } = useContext(ConversationOptionsContext);
    const isDestinationStory = !!(checkpoints || []).length;

    const submitTitleInput = () => {
        if (title === newTitle) return null;
        if (!newTitle.replace(/\s/g, '').length) return setNewTitle(title);
        return updateStory({ _id, title: newTitle });
    };

    const handleInputKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            event.target.blur();
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            setNewTitle(title);
            event.target.blur();
            updateStory({ _id, title });
        }
    };

    const renderWarnings = () => {
        const pluralize = warnings > 1 ? 's' : '';
        if (warnings <= 0) {
            return <></>;
        }
        return (
            <Label
                className='exception-label'
                color='yellow'
                data-cy='top-menu-warning-alert'
            >
                <Icon name='exclamation circle' />
                {warnings} Warning{pluralize}
            </Label>
        );
    };

    const renderErrors = () => {
        const pluralize = errors > 1 ? 's' : '';
        if (errors <= 0) {
            return <></>;
        }
        return (
            <Label className='exception-label' color='red' data-cy='top-menu-error-alert'>
                <Icon name='times circle' />
                {errors} Error{pluralize}
            </Label>
        );
    };

    const renderConnectedStories = () => {
        const connectedStories = stories.filter(({ _id: cId }) => checkpoints.some(originId => cId === originId[0]));
        return (
            <List data-cy='response-locations-list' className='link-list'>
                {connectedStories.map(({ _id: cId, title: connectedTitle }) => (
                    <List.Item
                        key={cId}
                        onClick={() => linkToStory(cId)}
                        data-cy='story-name-link'
                    >
                        <span className='story-title-prefix'>##</span>
                        <span className='story-name-link'>{connectedTitle}</span>
                    </List.Item>
                ))}
            </List>
        );
    };

    const renderConvStartToggle = () => {
        if (type !== 'rule') return null;
        return (
            <Popup
                on='click'
                open={confirmPopupOpen}
                disabled={!can('stories:w', projectId) || !condition.length || !!convStart}
                onOpen={() => setConfirmPopupOpen(true)}
                onClose={() => setConfirmPopupOpen(false)}
                content={(
                    <ConfirmPopup
                        title='Conditions will be deleted!'
                        onYes={() => {
                            setConfirmPopupOpen(false);
                            updateStory({ _id, conversation_start: !convStart, condition: [] });
                        }}
                        onNo={() => setConfirmPopupOpen(false)}
                    />
                )}
                trigger={(
                    <Checkbox
                        toggle
                        disabled={!can('stories:w', projectId)}
                        label='conversation start'
                        className='story-box-toggle'
                        checked={convStart}
                        data-cy='toggle-conversation-start'
                        onClick={(e) => {
                            e.preventDefault();
                            if (!condition.length || !!convStart) updateStory({ _id, conversation_start: !convStart });
                        }}
                    />
                )}
            />
        );
    };

    const renderConditionSection = () => (
        <>
            <Header as='h5' dividing>&nbsp;&nbsp;Conditions</Header>
            {storyMode !== 'visual'
                ? renderAceEditor()
                : (
                    <StoryVisualEditor
                        onSave={c => updateStory({ _id, condition: c })}
                        story={condition}
                        getResponseLocations={getResponseLocations}
                        mode='rule_condition'
                    />
                )
            }
        </>
    );
    return (
        <>
            <Menu
                attached='top'
                data-cy='story-top-menu'
                className={`${collapsed ? 'collapsed' : ''}`}
            >
                <Menu.Item header>
                    <Icon
                        name='triangle right'
                        className={`${collapsed ? '' : 'opened'}`}
                        link
                        onClick={() => collapseStory(_id, !collapsed)}
                        data-cy='collapse-story-button'
                    />
                    {isDestinationStory ? (
                        <Icon name='arrow alternate circle right' color='green' fitted />
                    ) : (
                        <span className='story-title-prefix'>{type === 'rule' ? <>&gt;&gt;</> : '##'}</span>
                    )}
                    {status === 'unpublished' && <Label content='Unpublished' /> }
                    <input
                        data-cy='story-title'
                        disabled={!can('stories:w', projectId)}
                        value={newTitle}
                        onChange={event => setNewTitle(event.target.value.replace('_', ''))}
                        onKeyDown={handleInputKeyDown}
                        onBlur={submitTitleInput}
                    />
                </Menu.Item>
                <Menu.Item position='right'>
                    {renderWarnings()}
                    {renderErrors()}
                    {renderConvStartToggle()}
                    {can('triggers:r', projectId) && (
                        <StoryRulesEditor
                        // the trigger element will have it's onClick, disabled, and className props modified
                            trigger={(
                            
                                <Icon
                                    name='stopwatch'
                                    color={rules && rules.length ? 'green' : 'grey'}
                                    data-cy='edit-trigger-rules'
                                />
                            )}
                            storyId={_id}
                            rules={rules}
                            open={triggerEditorOpen}
                            setOpen={setTriggerEditorOpen}
                            isDestinationStory={isDestinationStory}
                        />
                    )}
                    <StoryPlayButton
                        fragment={fragment}
                        className='top-menu-clickable'
                    />
                </Menu.Item>
            </Menu>
            {isDestinationStory && (
                <Popup
                    className='connected-stories-popup'
                    size='small'
                    on='click'
                    position='bottom left'
                    trigger={(
                        <Message
                            className='top-menu-yellow-banner with-popup'
                            attached
                            warning
                            size='tiny'
                            data-cy='connected-to'
                        >
                            <Icon name='info circle' />
                            There are one or more stories linked to this story. You can
                            only delete it after unlinking all stories.
                        </Message>
                    )}
                >
                    {renderConnectedStories()}
                </Popup>
            )}
            {rules && rules.length > 0 && (
                <Message
                    className='connected-story-alert'
                    attached
                    warning
                    size='tiny'
                    onClick={() => setTriggerEditorOpen(true)}
                >
                    <Icon name='info circle' />
                    This story will be triggered automatically when the conditions set with the stopwatch icon are met.
                </Message>
            )}
            {type === 'rule' && !convStart && (
                <Message
                    className={`top-menu-yellow-banner condition-container ${!condition.length ? 'empty' : ''}`}
                    attached
                    warning
                    size='tiny'
                    data-cy='connected-to'
                >
                    {renderConditionSection()}
                </Message>
            )}
        </>
    );
};

StoryTopMenu.propTypes = {
    fragment: PropTypes.object.isRequired,
    collapsed: PropTypes.bool.isRequired,
    collapseStory: PropTypes.func.isRequired,
    warnings: PropTypes.number.isRequired,
    errors: PropTypes.number.isRequired,
    storyMode: PropTypes.string.isRequired,
    renderAceEditor: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
};
StoryTopMenu.defaultProps = {};

const mapStateToProps = (state, ownProps) => ({
    collapsed: state.stories.getIn(['storiesCollapsed', ownProps.fragment?._id], false),
    storyMode: state.stories.get('storyMode'),
    projectId: state.settings.get('projectId'),
});

const mapDispatchToProps = {
    collapseStory: setStoryCollapsed,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(StoryTopMenu);
