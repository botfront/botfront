import {
    Search,
    Menu,
    Icon,
} from 'semantic-ui-react';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import React, { useState, useCallback } from 'react';
import { withTracker } from 'meteor/react-meteor-data';

import { wrapMeteorCallback } from '../../utils/Errors';
import apolloClient from '../../../../startup/client/apollo';
import { setStoriesCurrent } from '../../../store/actions/actions';
import { StoryGroups } from '../../../../api/storyGroups/storyGroups.collection';


import { SEARCH_STORIES } from './queries';

const SearchBar = (props) => {
    const {
        projectId,
        language,
        router,
        storyGroups,
        ready,
        setActiveStories,
        activeStories,
    } = props;

    const [queryString, setQueryString] = useState('');
    const [open, setOpen] = useState(false);
    const [results, setResults] = useState({ stories: [], forms: [] });
    const [searching, setSearching] = useState(false);
    const [displayShortcuts, setDisplayShortcuts] = useState(false);

    const searchStories = useCallback(debounce(async (searchInputValue) => {
        const { data } = await apolloClient.query({
            query: SEARCH_STORIES,
            variables: {
                projectId,
                language,
                queryString: searchInputValue,
            },
            fetchPolicy: 'no-cache',
        });
        setSearching(false);
        const { storiesSearch: { stories = [] } = {} } = data;
        setResults({
            ...data.storiesSearch,

            // fixes a warning in the dev console
            stories: stories.map(({
                _id, storyGroupId, __typename, title,
            }) => (
                {
                    _id, title, __typename, 'story-group-id': storyGroupId,
                }
            )),
        });
    }, 500), [language, projectId]);

    const findPos = (originalElement) => {
        let element = originalElement;
        let position = 0;
        if (element.offsetParent) {
            do {
                position += element.offsetTop;
                element = element.offsetParent;
            } while (
                // the root element of this scrollbox is storygroup-tree
                // once we reach it we have the correct scroll height
                element.offsetParent && element.id !== 'storygroup-tree'
            );
            return [position];
        }
        return [0];
    };

    const doScroll = (storyId) => {
        const activeElement = document.getElementById(`story-menu-item-${storyId}`);
        if (!activeElement) return false;
        /*
                element.scroll is used instead of scrollIntoView
            because scrollIntoView acts on the immediate parent.
                In this case the parent element is not the element
            with the scrollbar and it causes bugs
        */
        activeElement.parentElement.parentElement.parentElement.scroll(0, findPos(activeElement));
        return true;
    };

    const scrollToStoryItem = (storyId, storyGroupId) => {
        const result = doScroll(storyId);
        if (result === true) return;
        Meteor.call('storyGroups.setExpansion', { _id: storyGroupId, projectId, isExpanded: true }, wrapMeteorCallback(() => {
            const secondAttemptResult = doScroll(storyId);
            if (secondAttemptResult === true) return;
            // retry scroll to active story until the story group is opened and the element exists
            const scrollToInterval = setInterval(() => {
                const intervalResult = doScroll(storyId);
                if (intervalResult || storyId !== activeStories[0]) clearTimeout(scrollToInterval);
            }, 100);
            setTimeout(() => clearTimeout(scrollToInterval), 2500);
        }));
    };
    
    const toggleStorySelected = (_id) => {
        const { location: { pathname } } = router;
        const nextActiveStories = new Set();
        const isSelected = activeStories.includes(_id);
        if (!isSelected) nextActiveStories.add(_id);
        if (typeof activeStories === 'string' && !isSelected) {
            nextActiveStories.add(activeStories);
        } else if (Array.isArray(activeStories)) {
            activeStories.forEach(sid => sid !== _id && nextActiveStories.add(sid));
        }
        router.replace({
            pathname,
            query: { 'ids[]': Array.from(nextActiveStories) },
        });
        setActiveStories(nextActiveStories);
    };

    const linkToStory = (event, { result }) => {
        const { _id, description: storyGroupId } = result;
        const { location: { pathname } } = router;
        scrollToStoryItem(_id, storyGroupId);
        if (event.shiftKey || event.target.id === 'push-story-icon') {
            toggleStorySelected(_id);
            return;
        }
        router.replace({ pathname, query: { 'ids[]': _id } });
        setActiveStories([_id]);
        setOpen(false);
    };

    const renderSearchItem = (resultProps) => {
        const {
            title, _id, 'story-group-id': storyGroupId, name, __typename: type,
        } = resultProps;
        const storyGroup = storyGroups.find(({ _id: gid }) => gid === storyGroupId);
        const isOpen = activeStories === _id || (Array.isArray(activeStories) && activeStories.includes(_id));
        const mainText = name || title;
        return (
            <Menu.Item
                className='stories-search-result'
                data-cy='stories-search-item'
                fitted
            >
                {type === 'Story' && <span className='search-item-prefix story'>##</span>}
                {type === 'Form' && <span className='search-item-prefix form' role='img' aria-label='form'>📝</span>}
                <span className='story-name'>{mainText}</span>
                { type === 'Story' && (
                    <span className='story-group-name'>
                        {storyGroup && storyGroup.name}
                    </span>
                )
                }
                <Icon
                    className={`push-story-icon ${isOpen ? 'story-open' : 'story-closed'}`}
                    floating='right'
                    name='eye'
                    id='push-story-icon'
                    data-cy='add-search-result-to-open'
                />
            </Menu.Item>
        );
    };

    const updateSearch = (value) => {
        if (value.length > 0) {
            setOpen(true);
            setDisplayShortcuts(false);
            setSearching(true);
            searchStories(value);
        }
        if (value.length === 0) {
            setResults([]);
            setOpen(false);
            setDisplayShortcuts(true);
        }
        setQueryString(value);
    };

    const Shortcut = shortcutProps => (
        <span
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                updateSearch(shortcutProps.value);
            }
            }
            onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
            onKeyDown={(event) => {
                if (event.keycode === 13) updateSearch(shortcutProps.value);
            }}
            role='button'
            tabIndex='0'
        >
            <Icon name='magic' />
            {shortcutProps.text}
        </span>
    );

    const renderShortcuts = () => (
        <div className='search-shortcuts'>
            <Shortcut value='with:highlights' text='Stories with onscreen guidance' />
            <Shortcut value='with:triggers' text='Stories with triggers' />
            <Shortcut value='with:custom_style' text='Stories with custom styles' />
            <Shortcut value='with:observe_events' text='Stories with user interactions callback' />
            <Shortcut value='status:unpublished' text='Unpublished stories' />
            <Shortcut value='status:published' text='Published stories' />
        </div>
    );

    return (
        <>
            {displayShortcuts && renderShortcuts()}
            <Search
                className={`story-search-bar ${queryString.length > 0 && 'has-text'}`}
                results={[
                    ...((results && Array.isArray(results.stories)) ? results.stories : []),
                    ...((results && Array.isArray(results.forms)) ? results.forms : []),
                ]}
                value={queryString}
                resultRenderer={renderSearchItem}
                icon={{ name: 'search', 'data-cy': 'stories-search-icon' }}
                onSearchChange={(e, a) => {
                    const { value } = a;
                    updateSearch(value);
                }}
                onResultSelect={linkToStory}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') setOpen(false);
                }}
                onFocus={() => {
                    if (queryString.length === 0) {
                        setDisplayShortcuts(true);
                    } else {
                        setOpen(true);
                    }
                }}
                onBlur={() => {
                    setDisplayShortcuts(false);
                    setOpen(false);
                }}
                onClick={() => {
                    if (queryString.length > 0) setOpen(true);
                }}
                loading={!ready || searching}
                showNoResults={!searching}
                open={open}
                data-cy='stories-search-bar'
            />
        </>
    );
};

SearchBar.propTypes = {
    projectId: PropTypes.string.isRequired,
    language: PropTypes.string.isRequired,
    router: PropTypes.object.isRequired,
    storyGroups: PropTypes.array.isRequired,
    ready: PropTypes.bool.isRequired,
    setActiveStories: PropTypes.func.isRequired,
    activeStories: PropTypes.array.isRequired,
};

const SearchBarWithTracker = withRouter(withTracker((props) => {
    const { projectId } = props;
    const storyGroupsHandler = Meteor.subscribe('storiesGroup', projectId);
    const storyGroups = StoryGroups.find().fetch();
    return {
        ready: storyGroupsHandler.ready(),
        storyGroups,
    };
})(SearchBar));

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
    language: state.settings.get('workingLanguage'),
    activeStories: state.stories.get('storiesCurrent').toJS(),
});

export default connect(mapStateToProps, { setActiveStories: setStoriesCurrent })(SearchBarWithTracker);
