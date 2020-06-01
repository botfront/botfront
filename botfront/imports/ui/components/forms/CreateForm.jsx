import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { GraphQLBridge } from 'uniforms-bridge-graphql';
import {
    AutoField,
    AutoForm,
    SubmitField,
    LongTextField,
} from 'uniforms-semantic';
import { buildASTSchema, parse } from 'graphql';
import { Segment } from 'semantic-ui-react';
import SelectField from '../form_fields/SelectField';
import ToggleField from '../common/ToggleField';
import { ProjectContext } from '../../layouts/context';


const CreateForm = (props) => {
    const {
        onSubmit,
    } = props;

    const schemaString = `
        type NewForm {
            name: String!
            description: String
            slots: [SlotToFill]
            collectInBotfront: Boolean
        }  
        type SlotToFill {
            name: String!
            filling: [String]
        }
    `;

    const schema = buildASTSchema(parse(`${schemaString}
    `)).getType('NewForm');

    const handleSubmit = (model) => {
        const modelSlots = model.slots.map(slot => ({ name: slot, filling: [] }));
        onSubmit({ ...model, slots: modelSlots });
    };

    const { slots } = useContext(ProjectContext);
    return (
        <div>
            <AutoForm model={{}} schema={new GraphQLBridge(schema, () => {}, {})} onSubmit={handleSubmit}>
                <Segment.Group>
                    <Segment attached='top'>
                        <AutoField name='name' label='' className='create-form-field' />
                    </Segment>
                    <Segment attached='bottom'>
                        <LongTextField name='description' className='create-form-field' />
                        <SelectField name='slots' options={slots.map(({ name: slot }) => ({ value: slot, text: slot }))} className='create-form-field' />
                        <ToggleField name='collectInBotfront' />
                        <SubmitField />
                    </Segment>
                </Segment.Group>
            </AutoForm>
        </div>
    );
};

CreateForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
};

export default CreateForm;
