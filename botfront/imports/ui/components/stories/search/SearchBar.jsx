import {
    Search,
    Menu,
    Icon,
} from 'semantic-ui-react';
import { debounce } from 'lodash';
import { withTracker } from 'meteor/react-meteor-data';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { StoryGroups } from '../../../../api/storyGroups/storyGroups.collection';
import apolloClient from '../../../../startup/client/apollo';


import { SEARCH_STORIES } from './queries';

const SearchBar = (props) => {
    const {
        projectId,
        language,
        router,
        storyGroups,
        ready,
    } = props;
    const [queryString, setQueryString] = useState('');
    const [open, setOpen] = useState(false);
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    /*
        if mutliSelectMode: true, result item clicks (with shift not held) will:
            - add the _id of the target result to the list of active stories
            - close the searchbar
    */
    const [multiSelectMode, setMultiSelectMode] = useState(false);
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
        setResults(data.stories);
    }, 500);
    const activeStories = router.getCurrentLocation().query['ids[]'] || [];

    document.addEventListener('click', (e) => {
        setOpen(false);
    });
    const pushActiveStory = (_id) => {
        const { location: { pathname } } = router;
        setMultiSelectMode(true);
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
        setOpen(false);
    };

    const linkToStory = (event, { result }) => {
        const { _id } = result;
        const { location: { pathname } } = router;
        if (event.shiftKey || event.target.id === 'push-story-icon') {
            pushActiveStory(_id);
            return;
        }
        if (multiSelectMode) {
            pushActiveStory(_id);
            setOpen(false);
            return;
        }
        
        router.replace({ pathname, query: { 'ids[]': _id } });
        setOpen(false);
    };

    const renderSearchItem = (resultProps) => {
        const { title, _id, storyGroupId } = resultProps;
        const storyGroup = storyGroups.find(({ _id: gid }) => gid === storyGroupId);
        return (
            <Menu.Item
                className='stories-search-result'
                fitted
            >
                <span>{title}</span>
                <span className='story-group-name'>
                    {storyGroup && storyGroup.name}
                </span>
                <Icon
                    disabled={!(activeStories === _id || (Array.isArray(activeStories) && activeStories.includes(_id)))}
                    className='push-story-icon'
                    floating='right'
                    name='eye'
                    id='push-story-icon'
                    onClick={() => pushActiveStory(_id)}
                />
            </Menu.Item>
        );
    };

    return (
        <>
            <Search
                className={`story-search-bar ${queryString.length > 0 && 'has-text'}`}
                onSearchChange={(e, a) => {
                    const { value } = a;
                    if (value.length > 0) setOpen(true);
                    if (value.length === 0) setOpen(false);
                    setQueryString(value);
                    setSearching(true);
                    searchStories(value);
                }}
                closeOnEscape
                onResultSelect={linkToStory}
                resultRenderer={renderSearchItem}
                open={open}
                value={queryString}
                results={results}
                loading={!ready || searching}
                showNoResults={!searching}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') setOpen(false);
                }}
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
});

export default connect(mapStateToProps)(SearchBarWithTracker);
