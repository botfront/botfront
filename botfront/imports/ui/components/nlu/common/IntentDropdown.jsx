import { Dropdown } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';

function IntentDropdown({
    onChange, onAddItem, options, intent, autofocus,
}) {
    const uniqueOptions = [...new Set(options.map(option => option.value))].map(value => ({
        text: value,
        value,
    }));
    return (
        <Dropdown
            searchInput={{ autoFocus: !intent && autofocus }}
            basic
            fluid
            openOnFocus
            className='icon intent-dropdown'
            icon='tag'
            name='intent'
            button
            placeholder='Select an intent'
            labeled
            search
            value={intent}
            allowAdditions
            selection
            additionLabel='Create intent: '
            onAddItem={onAddItem}
            onChange={onChange}
            options={uniqueOptions}
            data-cy='intent-dropdown'
        />
    );
}

IntentDropdown.propTypes = {
    onChange: PropTypes.func.isRequired,
    onAddItem: PropTypes.func.isRequired,
    options: PropTypes.array.isRequired,
    intent: PropTypes.string.isRequired,
    autofocus: PropTypes.bool,
};

IntentDropdown.defaultProps = {
    autofocus: false,
};

export default IntentDropdown;
