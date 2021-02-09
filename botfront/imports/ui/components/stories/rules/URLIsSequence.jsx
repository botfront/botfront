import BaseField from 'uniforms/BaseField';
import React, { useState } from 'react';
import { Item } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { getModelField } from '../../../../lib/autoForm.utils';

// We have to ensure that there's only one child, because returning an array
// from a component is prohibited.

const URLIsSequence = ({ name: parentName }, { uniforms }) => {
    const nameArray = parentName.split('.');
    const actualName = [...nameArray.slice(0, nameArray.length - 1), 'urlIsSequence'].join('.');
    const [checkboxValue, setCheckboxValue] = useState(getModelField(actualName, uniforms.model));
    const handleChangeValue = (e) => {
        e.preventDefault();
        uniforms.onChange(actualName, !checkboxValue);
        setCheckboxValue(!checkboxValue);
    };
    return (
        <Item className={`ui checkbox url-is-sequence-field ${checkboxValue ? 'checked' : 'empty'}`} onClick={handleChangeValue}>
            <label className='url-sequence-checkbox'>Only trigger if the URLs are visited in sequence (the top url being the last one visited)</label>
        </Item>

    );
};
URLIsSequence.contextTypes = BaseField.contextTypes;

URLIsSequence.propTypes = {
    name: PropTypes.string.isRequired,
};

export default URLIsSequence;
