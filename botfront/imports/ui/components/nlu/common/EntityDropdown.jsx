import { Dropdown } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';

import { entityPropType } from '../../utils/EntityUtils';

function EntityDropdown({
    entity, onAddItem, onChange, options,
}) {
    const uniqueOptions = [...new Set(options.map(option => option.value))].map(value => ({
        text: value,
        value,
    }));
    return (
        <Dropdown
            searchInput={{ autoFocus: !entity.entity }}
            icon='code'
            basic
            fluid
            button
            labeled
            className='icon entity-dropdown'
            placeholder='Select an entity... '
            search
            selection
            value={entity.entity}
            allowAdditions
            additionLabel='Add entity: '
            onAddItem={onAddItem}
            onChange={onChange}
            options={uniqueOptions}
            data-cy='entity-dropdown'
        />
    );
}

EntityDropdown.propTypes = {
    entity: PropTypes.shape(entityPropType).isRequired,
    onAddItem: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.array.isRequired,
};

export default EntityDropdown;
