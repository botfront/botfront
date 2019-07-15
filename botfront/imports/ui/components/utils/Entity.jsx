import React, { useState } from 'react';
import {
    Popup,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import './style/style.less';
import EntityDropdown from '../nlu/common/EntityDropdown';

const handleOnChange = (data, changeDropDownValue, onChangeEntity) => {
    changeDropDownValue(data.value);
    onChangeEntity(data.value);
};

function Entity({
    value,
    options,
    onChangeEntity,
    size,
    allowAdditions,
    allowEditing,
}) {
    options.push(value.value);
    const [dropDownValue, changeDropDownValue] = useState(value.value);
    return (
        <Popup
            trigger={
                (
                    <div className='entity-container'>
                        <div className={`${size}-entity-text entity`}>
                            {dropDownValue}
                        </div>
                        <div className={`${size}-entity-value entity`}>
                            {value.entity}
                        </div>
                    </div>

                )}
            content={
                (
                    <EntityDropdown
                        options={options.map(option => ({ value: option }))}
                        entity={dropDownValue}
                        onChange={(e, data) => handleOnChange(data, changeDropDownValue, onChangeEntity)}
                        allowAdditions={allowAdditions}
                    />
                )}
            on='click'
            disabled={!allowEditing}
        />
    );
}

Entity.propTypes = {
    onChangeEntity: PropTypes.func,
    size: PropTypes.string,
    options: PropTypes.array.isRequired,
    value: PropTypes.string.isRequired,
    allowAdditions: PropTypes.bool,
    allowEditing: PropTypes.bool,
};

Entity.defaultProps = {
    onChangeEntity: () => {},
    size: 'mini',
    allowAdditions: true,
    allowEditing: false,
};

export default Entity;
