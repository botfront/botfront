import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    Tab, Message, Segment, Header, Button,
} from 'semantic-ui-react';
import { saveAs } from 'file-saver';
import { useQuery } from '@apollo/react-hooks';
import { GET_FORMS } from '../stories/graphql/queries';
import { Loading } from '../utils/Utils';

const FormResults = (props) => {
    const { projectId, environment } = props;
    const environments = [environment];

    const [counts, setCounts] = useState(null);

    const { data: { getForms = [] } = {}, loading } = useQuery(GET_FORMS, {
        variables: { projectId, onlySlotList: true },
    });

    // this adds legacy forms (that are no longer defined, but for which results exist)
    const forms = [
        ...getForms,
        ...Object.keys(counts || {})
            .filter(k => !getForms.some(f => f.name === k))
            .map(k => ({ name: k })),
    ];

    useEffect(
        () => Meteor.call('forms.countSubmissions', { projectId, environments }, (_, res) => setCounts(res || {})),
        [environment],
    );

    const handleDownloadSubmissions = formName => async () => {
        const csvData = await Meteor.callWithPromise('forms.export', {
            projectId,
            environments,
            formName,
        });
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
        if (window.Cypress) {
            window.getCsvData = () => csvData;
            return null;
        }
        return saveAs(blob, `${formName}_submissions_${new Date().toISOString()}.csv`);
    };

    const renderFormSegment = (form) => {
        const count = form.name in (counts || {}) ? counts[form.name] : 0;
        const disabled = count < 1;
        const content = disabled
            ? !form.collect_in_botfront
                ? 'Form not set to receive submissions'
                : 'No submissions for this form'
            : `Export ${count} submission${count > 1 ? 's' : ''} to CSV format`;
        return (
            <Segment key={form.name}>
                <Header>
                    {form.name}
                    {(form.slots || []).length > 0 && (
                        <Header.Subheader>
                            Slots: <i>{form.slots.map(s => s.name).join(', ')}</i>
                        </Header.Subheader>
                    )}
                </Header>
                <p>
                    {form.description}
                    <br />
                </p>
                <Button
                    fluid
                    disabled={disabled}
                    primary
                    content={content}
                    data-cy='export-form-submissions'
                    onClick={handleDownloadSubmissions(form.name)}
                />
            </Segment>
        );
    };

    const renderFormSegments = () => forms.map(form => renderFormSegment(form));

    return (
        <Tab.Pane>
            <Loading loading={loading || !counts}>
                {!forms.length ? (
                    <>
                        <Message info content='No forms found' />
                        <br />
                    </>
                ) : (
                    renderFormSegments()
                )}
            </Loading>
        </Tab.Pane>
    );
};

FormResults.propTypes = {
    projectId: PropTypes.string.isRequired,
    environment: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
    environment: state.settings.get('workingDeploymentEnvironment'),
});

export default connect(mapStateToProps)(FormResults);
