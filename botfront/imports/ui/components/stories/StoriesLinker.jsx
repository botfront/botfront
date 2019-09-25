import React, { useContext } from 'react';
import { Dropdown } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { ConversationOptionsContext } from '../utils/Context';


function StoriesLinker({ disabled, onChange }) {
    const { stories } = useContext(ConversationOptionsContext);

    function reshapeStoriesData(data) {
        return data.map(story => ({ key: story._id, text: story.title, value: story.title }));
    }

    return (
        <Dropdown
            placeholder='Select story'
            fluid
            search
            selection
            clearable
            selectOnBlur={false}
            className='stories-linker'
            options={reshapeStoriesData(stories)}
            data-cy='stories-linker'
            disabled={disabled}
            onChange={onChange}
        />
    );
}

StoriesLinker.propTypes = {
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};


export default StoriesLinker;
