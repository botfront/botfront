import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';

import { Search } from 'semantic-ui-react';

import { SEARCH_STORIES } from './queries';

const SearchBar = (props) => {
    const {
        projectId,
        language,
    } = props;

    const [queryString, setQueryString] = useState('');

    const {
        loading, error, data,
    } = useQuery(SEARCH_STORIES, {
        variables: {
            projectId,
            language,
            queryString,
        },
    });
    if (error) throw error;

    const results = data ? data.stories : [];

    const linkToStory = (e, { result }) => {
        const { _id, title, storyGroupId } = result;
        // Link to the new story here
        console.log(_id);
        console.log(title);
        console.log(storyGroupId);
    };

    return (
        <>
            <Search
                loading={loading}
                onSearchChange={(_, { value }) => {
                    setQueryString(value);
                }}
                onResultSelect={linkToStory}
                value={queryString}
                results={results}
            />
        </>
    );
};

SearchBar.propTypes = {
    projectId: PropTypes.string.isRequired,
    language: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
    language: state.settings.get('workingLanguage'),
});

export default connect(mapStateToProps)(SearchBar);
