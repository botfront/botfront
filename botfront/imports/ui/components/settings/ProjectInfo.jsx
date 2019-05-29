import PropTypes from 'prop-types';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import {
    AutoForm, SubmitField, ErrorsField,
} from 'uniforms-semantic';
import { ProjectsSchema as projectsSchemaDefault } from '../../../api/project/project.schema.default';
import { Projects } from '../../../api/project/project.collection';
import InfoField from '../utils/InfoField';
import { wrapMeteorCallback } from '../utils/Errors';
import SelectField from '../form_fields/SelectField';
import { getNluModelLanguages } from '../../../api/nlu_model/nlu_model.utils';
import { can } from '../../../lib/scopes';

class ProjectInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = { saving: false };
    }

    onSave = (project) => {
        const { name, _id, defaultLanguage } = project;
        this.setState({ saving: true });
        Meteor.call('project.update', { name, _id, defaultLanguage },
            wrapMeteorCallback(() => this.setState({ saving: false }), 'Changes saved'));
    };

    render() {
        const { project, languages, ready } = this.props;
        const { saving } = this.state;
        const projectsSchema = Projects.simpleSchema();
        return (
            <>
                {ready && (
                    <AutoForm schema={projectsSchema || projectsSchemaDefault} model={project} onSubmit={this.onSave} disabled={!!saving || !can('project-settings:w', project._id)}>
                        <InfoField name='name' label='Name' className='project-name' />
                        {projectsSchema && projectsSchema.allowsKey('namespace') && (
                            <InfoField name='namespace' label='Namespace' disabled />
                        )}
                        {projectsSchema && projectsSchema.allowsKey('apiKey') && (
                            <InfoField name='apiKey' label='Botfront API key' disabled />
                        )}
                        <SelectField name='defaultLanguage' options={languages} className='project-default-language' />
                        <br />
                        <ErrorsField />
                        <SubmitField className='primary save-project-info-button' value='Save Changes' />
                    </AutoForm>
                )}
            </>
        );
    }
}

ProjectInfo.propTypes = {
    project: PropTypes.object.isRequired,
    languages: PropTypes.array.isRequired,
    ready: PropTypes.bool.isRequired,
};

const ProjectInfoContainer = withTracker(({ projectId }) => {
    const modelsHanlder = Meteor.subscribe('nlu_models.lite', projectId);
    const project = Projects.findOne({ _id: projectId }, {
        fields: {
            name: 1, namespace: 1, apiKey: 1, nlu_models: 1, defaultLanguage: 1,
        },
    });
    if (!project) return browserHistory.replace({ pathname: '/404' });
    const projectsHandler = Meteor.subscribe('projects', projectId);
    const ready = modelsHanlder.ready() && projectsHandler.ready();
    const languages = getNluModelLanguages(project.nlu_models, true);

    return {
        ready,
        project,
        languages,
    };
})(ProjectInfo);

const mapStateToProps = state => ({
    projectId: state.get('projectId'),
});

export default connect(mapStateToProps)(ProjectInfoContainer);
