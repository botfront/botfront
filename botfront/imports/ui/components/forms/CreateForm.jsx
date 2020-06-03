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
import { clearTypenameField } from '../../../lib/client.safe.utils';


const CreateForm = (props) => {
    const {
        initialModel,
        onSubmit,
    } = props;

    const getFormattedModel = () => (clearTypenameField({
        ...initialModel,
        slotNames: initialModel.slots.map(({ name }) => name),
    }));

    const schemaString = `
        type NewForm {
            name: String!
            description: String
            slotNames: [String]
            collect_in_botfront: Boolean
        }
    `;

    const schema = buildASTSchema(parse(`${schemaString}
    `)).getType('NewForm');

    const handleSubmit = (incomingModel) => {
        const model = { ...incomingModel };
        const modelSlots = model.slotNames.map((slot) => {
            const slotData = initialModel.slots.find(({ name }) => name === slot);
            return { name: slot, filling: slotData ? slotData.filling : [] };
        });
        delete model.slotNames;
        onSubmit({ ...model, slots: modelSlots });
    };

    const { slots } = useContext(ProjectContext);

    return (
        <div>
            <AutoForm model={getFormattedModel()} schema={new GraphQLBridge(schema, () => {}, {})} onSubmit={handleSubmit}>
                <Segment.Group className='story-card form-editor'>
                    <Segment attached='top' className='form-editor-topbar story-card-topbar'>
                        <AutoField name='name' label='' className='create-form-field' />
                    </Segment>
                    <Segment attached='bottom' className='form-editor-content'>
                        <LongTextField name='description' className='create-form-field' />
                        <SelectField name='slotNames' options={slots.map(({ name: slot }) => ({ value: slot, text: slot }))} className='create-form-field' />
                        <ToggleField name='collect_in_botfront' />
                        <SubmitField value='Save' />
                    </Segment>
                </Segment.Group>
            </AutoForm>
        </div>
    );
};

CreateForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    initialModel: PropTypes.object,
};

CreateForm.defaultProps = {
    initialModel: { slotNames: [] },
};

export default CreateForm;
