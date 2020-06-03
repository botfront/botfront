import React, { useContext } from 'react';
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
        forms,
        slots,
    } = props;
    const { upsertForm } = useContext(ConversationOptionsContext);
    const { data, refetch } = useQuery(GET_FORMS, { variables: { projectId, ids: forms } });

    useSubscription(
        FORMS_MODIFIED,
        {
            variables: { projectId },
            onSubscriptionData: () => {
            },
        },
    );

    const getSlotAndFormData = (formId, slotName) => {
        const form = data.getForms.find(({ _id }) => _id === formId);
        if (!form) return {};
        const slot = form.slots.find(({ name }) => name === slotName);
        return { slot, form };
    };

    const handleChangeSlotFilling = (formId, { name: slotName, ...rest }) => {
        const formData = data.getForms.find(({ _id }) => _id === formId);
        const updatedSlots = [...formData.slots];
        const slotIndex = updatedSlots.findIndex(({ name }) => name === slotName);
        updatedSlots[slotIndex] = { name: slotName, ...rest };
        const update = { ...formData, slots: updatedSlots };
        upsertForm(clearTypenameField(update)).then(() => refetch());
    };

    const renderForm = (formId) => {
        const formData = data.getForms.find(({ _id }) => _id === formId);
        if (!formData) return <></>;
        return <CreateForm initialModel={formData} onSubmit={upsertForm} />;
    };

    const renderSlot = (slotName) => {
        const formId = forms[0];
        const { slot, form } = getSlotAndFormData(formId, slotName);
        if (!slot || !form) return <></>;
        return (
            <FormEditorContainer key={`${slotName}-${formId}`} formId={formId} formName={form.name} slotName={slotName} slotFillingProp={slot} onChange={handleChangeSlotFilling} />
        );
    };

    return (
        <>
            <Loader active={!forms || !data} />
            {data && (
                <>
                    {slots[0] === forms[0] && forms.map(form => renderForm(form))}
                    {slots[0] !== forms[0] && slots.map(slot => renderSlot(slot))}
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
