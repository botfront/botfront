import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { Loader } from 'semantic-ui-react';
import { useMutation, useSubscription, useQuery } from '@apollo/react-hooks';
import FormEditorContainer from './FormEditorContainer';
import CreateForm from './CreateForm';
import { UPSERT_FORM, GET_FORMS } from '../stories/graphql/queries';

import { ConversationOptionsContext } from '../stories/Context';

const FormEditors = (props) => {
    const {
        projectId,
        forms,
        slots,
    } = props;
    const { upsertForm } = useContext(ConversationOptionsContext);
    const { data, refetch } = useQuery(GET_FORMS, { variables: { projectId, forms } }); // test code should be replaced

    const renderForm = (form) => {
        const formData = data.getForms.find(({ name }) => name === form);
        if (!formData) return <></>;
        return <CreateForm initialModel={formData} onSubmit={upsertForm} />;
    };

    const getSlotData = (formName, slotName) => {
        const formData = data.getForms.find(({ name }) => name === formName);
        if (!formData) return null;
        const slot = formData.slots.find(({ name }) => name === slotName);
        return slot;
    };

    const handleChangeSlotFilling = (formName, { name: slotName, ...rest }) => {
        const formData = data.getForms.find(({ name }) => name === formName);
        const updatedSlots = [...formData.slots];
        const slotIndex = updatedSlots.findIndex(({ name }) => name === slotName);
        updatedSlots[slotIndex] = { name: slotName, ...rest };
        const update = { ...formData, slots: updatedSlots };
        upsertForm(update).then(() => refetch());
    };

    const renderSlot = (slotName, formName) => {
        const slot = getSlotData(formName, slotName);
        return (
            <FormEditorContainer key={`${slotName}-${formName}`} formName={formName} slotName={slotName} slotFillingProp={slot} onChange={handleChangeSlotFilling} />
        );
    };

    return (
        <>
            <Loader active={!forms || !data} />
            {data && (
                <>
                    {slots.map(slot => renderSlot(slot.slot, slot.form))}
                    {forms.map(form => renderForm(form))}
                </>
            )}
        </>
    );
};

FormEditors.propTypes = {
    projectId: PropTypes.string.isRequired,
    forms: PropTypes.array,
    slots: PropTypes.array,
};

FormEditors.defaultProps = {
    forms: [],
    slots: [],
};

export default FormEditors;
