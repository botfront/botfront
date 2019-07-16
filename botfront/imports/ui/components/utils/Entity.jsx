import React, { useState, useContext } from 'react';
import {
    Popup,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import './style/style.less';
import EntityDropdown from '../nlu/common/EntityDropdown';
import { EntityContext } from './Context';

const handleOnChange = (data, changeDropDownValue, onChangeEntity) => {
    changeDropDownValue(data.value);
    onChangeEntity(data.value);
};

function Entity({
    value,
    onChangeEntity,
    size,
    allowAdditions,
    allowEditing,
}) {
    const { options } = useContext(EntityContext);
    options.push(value.entity);
    const [dropDownValue, changeDropDownValue] = useState(value.entity);
    return (
        <Popup
            trigger={
                (
                    <div className='entity-container'>
                        <div className={`${size}-entity-text entity`}>
                            {dropDownValue}
                        </div>
                        <div className={`${size}-entity-value entity`}>
                            {value.value}
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
