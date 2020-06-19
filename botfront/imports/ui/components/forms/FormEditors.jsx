import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Loader } from 'semantic-ui-react';
import { useSubscription, useQuery } from '@apollo/react-hooks';
import FormEditorContainer from './FormEditorContainer';
import CreateForm from './CreateForm';
import { GET_FORMS } from '../stories/graphql/queries';
import { FORMS_MODIFIED } from '../stories/graphql/subscriptions';
import { clearTypenameField } from '../../../lib/client.safe.utils';

import { ConversationOptionsContext } from '../stories/Context';

const FormEditors = (props) => {
    const {
        projectId,
        formIds,
        slots,
    } = props;
    const { upsertForm } = useContext(ConversationOptionsContext);
    const [forms, setForms] = useState([]);
    const { data } = useQuery(GET_FORMS, { variables: { projectId, ids: formIds } });

    useEffect(() => setForms(data ? data.getForms : []), [data]);

    useSubscription(
        FORMS_MODIFIED,
        {
            variables: { projectId },
            onSubscriptionData: ({ subscriptionData }) => {
                if (!subscriptionData) return;
                if (!subscriptionData.data) return;
                const modifiedForm = subscriptionData.data.formsModified;
                const updatedForms = forms.map((form) => {
                    if (form._id === modifiedForm._id) return modifiedForm;
                    return form;
                });
                setForms(updatedForms);
            },
        },
    );

    const getSlotAndFormData = (formId, slotName) => {
        const form = forms.find(({ _id }) => _id === formId);
        if (!form || !form.slots) return {};
        const slot = form.slots.find(({ name }) => name === slotName);
        return { slot, form };
    };

    const handleChangeSlotFilling = (formId, { name: slotName, ...rest }) => {
        const formData = forms.find(({ _id }) => _id === formId);
        const updatedSlots = [...formData.slots];
        const slotIndex = updatedSlots.findIndex(({ name }) => name === slotName);
        updatedSlots[slotIndex] = { name: slotName, ...rest };
        const update = { ...formData, slots: updatedSlots };
        upsertForm(clearTypenameField(update));
    };

    const renderForm = (formId, i) => {
        const formData = forms.find(({ _id }) => _id === formId);
        if (!formData) return <React.Fragment key={`form-fragment-${i}`}></React.Fragment>;
        return <CreateForm key={`form-${formId}`} initialModel={formData} onSubmit={upsertForm} />;
    };

    const renderSlot = (slotName, i) => {
        const formId = formIds[0];
        const { slot, form } = getSlotAndFormData(formId, slotName);
        if (!slot || !form) return <React.Fragment key={`slot-fragment-${i}`}></React.Fragment>;
        return (
            <FormEditorContainer key={`${slotName}-${formId}`} formId={formId} formName={form.name} slotName={slotName} slotFillingProp={slot} onChange={handleChangeSlotFilling} />
        );
    };
    return (
        <>
            <Loader active={!formIds || !data} />
            {data && (
                <>
                    {slots[0] === formIds[0] && formIds.map(form => renderForm(form))}
                    {slots[0] !== formIds[0] && slots.map(slot => renderSlot(slot))}
                </>
            )}
        </>
    );
};

FormEditors.propTypes = {
    projectId: PropTypes.string.isRequired,
    formIds: PropTypes.array,
    slots: PropTypes.array,
};

FormEditors.defaultProps = {
    formIds: [],
    slots: [],
};

export default FormEditors;
