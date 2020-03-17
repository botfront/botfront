import {
    Search,
    Menu,
    Icon,
    Item,
    Button,
} from 'semantic-ui-react';
import { debounce } from 'lodash';
import { withTracker } from 'meteor/react-meteor-data';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { StoryGroups } from '../../../../api/storyGroups/storyGroups.collection';
import apolloClient from '../../../../startup/client/apollo';
import { setStoriesCurrent } from '../../../store/actions/actions';


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
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const searchStories = debounce(async () => {
        const { data } = await apolloClient.query({
            query: SEARCH_STORIES,
            variables: {
                projectId,
                language,
                queryString,
            },
        });
        setSearching(false);
        setResults(data.stories.map(story => ({
            title: story.title, _id: story._id, description: story.storyGroupId,
        })));
    }, 500);

    // close the search results dropdown on outside clicks
    document.addEventListener('click', () => {
        setOpen(false);
    });
    
    const pushActiveStory = (_id) => {
        const { location: { pathname } } = router;
        const nextActiveStories = new Set();
        nextActiveStories.add(_id);
        if (typeof activeStories === 'string') {
            nextActiveStories.add(activeStories);
        } else if (Array.isArray(activeStories)) {
            activeStories.forEach(sid => nextActiveStories.add(sid));
        }
        router.replace({
            pathname,
            query: { 'ids[]': Array.from(nextActiveStories) },
        });
        setActiveStories(nextActiveStories);
    };

    const linkToStory = (event, { result }) => {
        const { _id } = result;
        const { location: { pathname } } = router;
        if (event.shiftKey || event.target.id === 'push-story-icon') {
            pushActiveStory(_id);
            return;
        }
        router.replace({ pathname, query: { 'ids[]': _id } });
        setActiveStories([_id]);
        setOpen(false);
    };

    const renderSearchItem = (resultProps) => {
        const { title, _id, description: storyGroupId } = resultProps;
        const storyGroup = storyGroups.find(({ _id: gid }) => gid === storyGroupId);
        const isOpen = activeStories === _id || (Array.isArray(activeStories) && activeStories.includes(_id));
        return (
            <Menu.Item
                className='stories-search-result'
                data-cy='stories-search-item'
                fitted
            >
                <span className='story-name'>{title}</span>
                <span className='story-group-name'>
                    {storyGroup && storyGroup.name}
                </span>
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

    return (
        <>
            <Search
                className={`story-search-bar ${queryString.length > 0 && 'has-text'}`}
                results={results}
                value={queryString}
                resultRenderer={renderSearchItem}
                icon={{ name: 'search', 'data-cy': 'stories-search-icon' }}
                onSearchChange={(e, a) => {
                    const { value } = a;
                    if (value.length > 0) setOpen(true);
                    if (value.length === 0) {
                        setResults([]);
                        setOpen(false);
                    }
                    setQueryString(value);
                    setSearching(true);
                    searchStories(value);
                }}
                onResultSelect={linkToStory}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') setOpen(false);
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
    storyGroups: PropTypes.object.isRequired,
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
