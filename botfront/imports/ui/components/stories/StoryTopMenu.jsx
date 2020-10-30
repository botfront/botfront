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

const StoryTopMenu = ({
    fragment,
    collapsed,
    collapseStory,
    warnings,
    errors,
    storyMode,
    renderAceEditor,
}) => {
    const {
        type,
        _id,
        title,
        checkpoints,
        steps,
        condition = [],
        conversation_start: convStart,
    } = fragment;
    const initPayload = steps?.[0]?.intent;
    const [newTitle, setNewTitle] = useState(title);
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
                disabled={!condition.length || !!convStart}
                onOpen={() => setConfirmPopupOpen(true)}
                onClose={() => setConfirmPopupOpen(false)}
                content={(
                    <ConfirmPopup
                        title='Condition will be deleted!'
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
                        label='conversation start'
                        checked={convStart}
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
            <Header as='h5' dividing>Condition</Header>
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
                    <input
                        data-cy='story-title'
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
                    <StoryPlayButton
                        initPayload={initPayload}
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
};
StoryTopMenu.defaultProps = {};

const mapStateToProps = (state, ownProps) => ({
    collapsed: state.stories.getIn(['storiesCollapsed', ownProps.fragment?._id], false),
    storyMode: state.stories.get('storyMode'),
});

const mapDispatchToProps = {
    collapseStory: setStoryCollapsed,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(StoryTopMenu);
