import React, {
    useContext, useState, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { GraphQLBridge } from 'uniforms-bridge-graphql';
import {
    AutoField,
    AutoForm,
    SubmitField,
    LongTextField,
    ErrorsField,
} from 'uniforms-semantic';
import { buildASTSchema, parse } from 'graphql';
import { Segment, Popup } from 'semantic-ui-react';
import { can } from '../../../lib/scopes';
import SelectField from '../form_fields/SelectField';
import ToggleField from '../common/ToggleField';
import { ProjectContext } from '../../layouts/context';
import { clearTypenameField, formNameIsValid } from '../../../lib/client.safe.utils';


const CreateForm = (props) => {
    const {
        initialModel,
        onSubmit,
        projectId,
    } = props;

    const { slots } = useContext(ProjectContext);
    const [slotAdditions, setSlotAdditions] = useState([]);

    useEffect(() => {
        // if any slots in the form do not exist in the database add them to options
        if (!Array.isArray(initialModel.slots)) return;
        const newOptions = initialModel.slots.reduce((acc, slot) => {
            if (!slots.some(({ name }) => name === slot.name)) {
                return [...acc, { name: slot.name }];
            }
            return acc;
        }, []);
        setSlotAdditions([...slotAdditions, ...newOptions]);
    }, [initialModel]);

    const getFormattedModel = () => (clearTypenameField({
        ...initialModel,
        description: initialModel.description || '',
        slotNames: (initialModel.slots || []).map(({ name }) => name),
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
        onSubmit(clearTypenameField({ ...model, slots: modelSlots }));
    };


    const validator = (model) => {
        const errors = [];
        if (!formNameIsValid(model.name)) {
            errors.push({ name: 'name', message: 'Form names must end with <i>_form</i> and have no special characters. the text before <i>_form</i> can not contain <i>form</i>' });
        }
        if (errors.length) {
            // eslint-disable-next-line no-throw-literal
            throw { details: errors };
        }
    };

    const handleAddItem = (_, { value }) => {
        setSlotAdditions([...slotAdditions, { name: value }]);
    };

    const options = [...slots, ...slotAdditions].map(({ name: slot }) => (
        { value: slot, text: slot }
    ));
    return (
        <div>
            <AutoForm model={getFormattedModel()} schema={new GraphQLBridge(schema, validator, {})} onSubmit={handleSubmit} disabled={!can('stories:w', projectId)}>
                <Segment.Group className='story-card form-editor'>
                    <Segment attached='top' className='form-editor-topbar story-card-topbar' key='topbar'>
                        <Popup
                            inverted
                            trigger={
                                <AutoField name='name' label='' className='create-form-field' data-cy='form-name-field' />
                            }
                            size='tiny'
                            content={<>form names must end with <i>_form</i> and have no special characters.</>}
                        />
                    </Segment>
                    <Segment attached='bottom' className='form-editor-content' key='content'>
                        <LongTextField name='description' className='create-form-field' data-cy='form-description-field' />
                        <SelectField
                            data-cy='form-slots-field'
                            name='slotNames'
                            options={options}
                            confirmDeletions
                            className='create-form-field'
                            allowAdditions
                            onAddItem={handleAddItem}
                        />
                        <ToggleField name='collect_in_botfront' data-cy='form-collection-togglefield' />
                        <ErrorsField data-cy='error' />
                        <SubmitField value='Save' data-cy='form-submit-field' />
                    </Segment>
                </Segment.Group>
            </AutoForm>
        </div>
    );
};

CreateForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    initialModel: PropTypes.object,
    projectId: PropTypes.string.isRequired,
};

CreateForm.defaultProps = {
    initialModel: { slotNames: [] },
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(CreateForm);
