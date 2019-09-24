import React, { useContext } from 'react';
import { Dropdown } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { ConversationOptionsContext } from '../utils/Context';


function StoriesLinker({ disabled }) {
    const { stories } = useContext(ConversationOptionsContext);

    function reshapeStoriesData(data) {
        return data.map(story => ({ key: story._id, text: story.title }));
    }

    return (
        <Dropdown
            placeholder='Select story'
            fluid
            search
            selection
            className='stories-linker'
            options={reshapeStoriesData(stories)}
            data-cy='stories-linker'
            disabled={disabled}
        />
    );
}

StoriesLinker.propTypes = {
    disabled: PropTypes.bool,
};

StoriesLinker.defaultProps = {
    disabled: false,
};


export default StoriesLinker;
