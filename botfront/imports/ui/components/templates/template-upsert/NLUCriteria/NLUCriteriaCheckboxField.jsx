import React, { Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import BaseField from 'uniforms/BaseField';
import { Checkbox } from 'semantic-ui-react';

// This field works as follows: on click of its child it swaps values of fieldA
// and fieldB. It's that simple.
const NLUCriteriaCheckboxField = ({ children }, { uniforms: { model, onChange } }) => (
    <div id='nlu-criteria-toggle'>
        <Checkbox
            toggle
            label='This bot response should be triggered by NLU criteria'
            checked={!!model.match}
            onChange={(e, { checked }) => {
                onChange('match', checked ? { nlu: [{ intent: null, entities: [] }] } : null);
                onChange('followUp', checked ? {} : null);
            }}
        />
        { !!model.match && cloneElement(Children.only(children))}
    </div>
);
NLUCriteriaCheckboxField.contextTypes = BaseField.contextTypes;

NLUCriteriaCheckboxField.propTypes = {
    children: PropTypes.object.isRequired,
};

export default NLUCriteriaCheckboxField;
