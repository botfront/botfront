import {
    Popup, Icon, Menu, Label, Message,
} from 'semantic-ui-react';
import { connect } from 'react-redux';
import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import 'brace/theme/github';
import 'brace/mode/text';
import StoryPlayButton from './StoryPlayButton';
import {
    setStoryCollapsed, setStoriesCollapsed,
} from '../../store/actions/actions';
import { ConversationOptionsContext } from './Context';

const StoryTopMenu = ({
    type,
    storyId,
    title,
    collapsed,
    collapseStory,
    warnings,
    errors,
    originStories,
    initPayload,
    collapseAllStories,
}) => {
    const [newTitle, setNewTitle] = useState(title);
    useEffect(() => setNewTitle(title), [title]);

    const { stories, updateStory } = useContext(ConversationOptionsContext);
    const isDestinationStory = !!(originStories || []).length;

    const submitTitleInput = () => {
        if (title === newTitle) return null;
        if (!newTitle.replace(/\s/g, '').length) return setNewTitle(title);
        return updateStory({ _id: storyId, title: newTitle });
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
            updateStory({ _id: storyId, title });
        }
    };

    const handleCollapseAllStories = () => {
        const storiesCollapsed = {};
        stories.forEach(({ _id }) => { storiesCollapsed[_id] = !collapsed; });
        collapseAllStories(storiesCollapsed);
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
        const connectedStories = stories.filter(({ _id }) => originStories.some(originId => _id === originId[0]));
        return connectedStories.map(({ _id, title: connectedTitle }) => (
            <p key={_id} className='title-list-elem'>
                <span className='story-title-prefix'>##</span>{connectedTitle}
            </p>
        ));
    };

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
                        onClick={() => collapseStory(storyId, !collapsed)}
                        onDoubleClick={() => handleCollapseAllStories()}
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
                        // disabled // don't allow name change here, so we don't have to update left-hand tree
                    />
                </Menu.Item>
                <Menu.Item position='right'>
                    {renderWarnings()}
                    {renderErrors()}
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
                            className='connected-story-alert'
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
        </>
    );
};

StoryTopMenu.propTypes = {
    type: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    storyId: PropTypes.string.isRequired,
    collapsed: PropTypes.bool.isRequired,
    collapseStory: PropTypes.func.isRequired,
    warnings: PropTypes.number.isRequired,
    errors: PropTypes.number.isRequired,
    originStories: PropTypes.array,
    initPayload: PropTypes.string,
    collapseAllStories: PropTypes.func.isRequired,
};
StoryTopMenu.defaultProps = {
    originStories: [],
    initPayload: null,
};

const mapStateToProps = (state, ownProps) => ({
    collapsed: state.stories.getIn(['storiesCollapsed', ownProps.storyId], false),
});

const mapDispatchToProps = {
    collapseStory: setStoryCollapsed,
    collapseAllStories: setStoriesCollapsed,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(StoryTopMenu);
