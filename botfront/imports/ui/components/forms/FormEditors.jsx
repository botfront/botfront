import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Loader } from 'semantic-ui-react';
import { useSubscription, useQuery } from '@apollo/react-hooks';
import Form from './Form';
import { GET_FORMS } from '../stories/graphql/queries';
import { FORMS_MODIFIED } from '../stories/graphql/subscriptions';

import { ConversationOptionsContext } from '../stories/Context';

const FormEditors = (props) => {
    const {
        projectId,
        formIds,
    } = props;
    const { upsertForm } = useContext(ConversationOptionsContext);
    const [forms, setForms] = useState([]);
    const { data } = useQuery(GET_FORMS, { variables: { projectId, ids: formIds }, fetchPolicy: 'no-cache' });

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

    const renderForm = (formId) => {
        const formData = forms.find(({ _id }) => _id === formId);
        if (!formData) return <React.Fragment key={`form-fragment-${formId}`}></React.Fragment>;
        return <Form key={`form-${formId}`} initialModel={formData} onSubmit={upsertForm} />;
    };
    return (
        <>
            <Loader active={!formIds || !data} />
            {data && (
                <>
                    {!!forms[0] && renderForm(formIds[0])}
                </>
            )}
        </>
    );
};

FormEditors.propTypes = {
    projectId: PropTypes.string.isRequired,
    formIds: PropTypes.array,
};

FormEditors.defaultProps = {
    formIds: [],
};

export default FormEditors;
