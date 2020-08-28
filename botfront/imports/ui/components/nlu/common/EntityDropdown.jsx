import { Dropdown } from 'semantic-ui-react';
import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { ProjectContext } from '../../../layouts/context';

import { entityPropType } from '../../utils/EntityUtils';

// eslint-disable-next-line no-control-regex
const asciiChar = /^[\x21-\x7E]+$/;

function EntityDropdown({
    entity,
    onAddItem,
    onChange,
    allowAdditions,
}) {
    const { entities = [] } = useContext(ProjectContext);
    const options = [...new Set([
        ...((entity && entity.entity) ? [entity] : []), ...entities,
    ].map(
        option => (typeof option === 'string' ? option : option.entity),
    ))]
        .filter(o => o)
        .map(value => ({
            text: value,
            value,
        }));

    const [searchInputState, setSearchInputState] = useState('');

    const handleSearchChange = (_e, { searchQuery }) => {
        // !searchQuery means emtpy string
        if (asciiChar.test(searchQuery) || !searchQuery) {
            setSearchInputState(searchQuery);
        }
    };

    return (
        <Dropdown
            icon='code'
            basic
            fluid
            button
            labeled
            className='icon entity-dropdown'
            placeholder='Select an entity... '
            search
            selection
            value={entity && entity.entity}
            allowAdditions={allowAdditions}
            additionLabel='Add entity: '
            onAddItem={(_, { value }) => onAddItem(value)}
            onChange={(_, { value }) => onChange(value)}
            onSearchChange={handleSearchChange}
            searchQuery={searchInputState}
            options={options}
            data-cy='entity-dropdown'
        />
    );
}

EntityDropdown.propTypes = {
    entity: PropTypes.shape(entityPropType).isRequired,
    onAddItem: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    allowAdditions: PropTypes.bool,
};

EntityDropdown.defaultProps = {
    allowAdditions: true,
};

export default EntityDropdown;
