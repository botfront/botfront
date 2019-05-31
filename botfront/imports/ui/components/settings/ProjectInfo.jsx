import PropTypes from 'prop-types';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import {
    AutoForm, SubmitField, ErrorsField,
} from 'uniforms-semantic';
import { Dropdown, Form, Message } from 'semantic-ui-react';
import { ProjectsSchema as projectsSchemaDefault } from '../../../api/project/project.schema.default';
import { Projects } from '../../../api/project/project.collection';
import InfoField from '../utils/InfoField';
import { wrapMeteorCallback } from '../utils/Errors';
import SelectField from '../form_fields/SelectField';
import { getNluModelLanguages } from '../../../api/nlu_model/nlu_model.utils';
import { languages } from '../../../lib/languages';

class ProjectInfo extends React.Component {
    constructor(props) {
        super(props);
        const { modelLanguages } = this.props;
        this.state = { saving: false, value: modelLanguages.map(lang => (lang.value)) };
    }

    getOptions = () => {
        const renderOptions = Object.keys(languages).map(code => ({
            text: languages[code].name,
            key: code,
            value: code,
        }));
        return renderOptions;
    };

    diffArray = (array1, array2) => {
        const diffArray = array1.filter(elementArray1 => (array2.indexOf(elementArray1)) < 0);
        return diffArray;
    }

    renderLabel = (language, languageCodes) => {
        const isModelExist = languageCodes.includes(language.value);
        const label = {
            color: isModelExist ? 'blue' : 'green',
            content: `${language.text}`,
        };
        if (!isModelExist) return label;
        label.removeIcon = true;
        return label;
    };

    onChange = (e, { value }) => {
        this.setState({ saving: false, value });
    }

    createNLUModels = (languageArray, projectId) => {
        const nluInsertArray = languageArray.map(language => (
            Meteor.callWithPromise('nlu.insert', {
                name: 'Default Model',
                language,
                description: 'To be modified',
            },
            projectId)
        ));
        Promise.all(nluInsertArray).then(() => {
            this.setState({ saving: false });
        });
    }

    onSave = (project, modelLanguages) => {
        const { value } = this.state;
        const { name, _id, defaultLanguage } = project;
        const differenceArray = this.diffArray(value, modelLanguages.map(lang => (lang.value)));
        this.setState({ saving: true });
        Meteor.call('project.update', { name, _id, defaultLanguage },
            wrapMeteorCallback(() => this.createNLUModels(differenceArray, _id), 'Changes saved'));
    };

    render() {
        const { project, modelLanguages, ready } = this.props;
        const { saving, value } = this.state;
        const projectsSchema = Projects.simpleSchema();
        return (
            <>
                {!!modelLanguages && (
                    <Message info>
                        <Message.Content>
                            <Message.Header>Removing a language</Message.Header>
                                To remove a language from the project, go to NLU Model > Settings > Delete.
                        </Message.Content>
                    </Message>)
                }
                {ready && (
                    <AutoForm schema={projectsSchema || projectsSchemaDefault} model={project} onSubmit={() => this.onSave(project, modelLanguages)} disabled={saving}>
                        <InfoField name='name' label='Name' className='project-name' />
                        {projectsSchema && projectsSchema.allowsKey('namespace') && (
                            <InfoField name='namespace' label='Namespace' disabled />
                        )}
                        {projectsSchema && projectsSchema.allowsKey('apiKey') && (
                            <InfoField name='apiKey' label='Botfront API key' disabled />
                        )}
                        <Form.Field>
                            <label> Select Languages </label>
                            <Dropdown
                                label='Select Languages'
                                name='lang'
                                placeholder='Add languages'
                                multiple
                                search
                                value={value}
                                selection
                                onChange={this.onChange}
                                options={this.getOptions()}
                                renderLabel={language => this.renderLabel(language, modelLanguages.map(lang => (lang.value)))}
                            />
                        </Form.Field>
                        { !!modelLanguages && <SelectField name='defaultLanguage' options={modelLanguages} className='project-default-language' />}
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
    modelLanguages: PropTypes.array.isRequired,
    ready: PropTypes.bool.isRequired,
};

const ProjectInfoContainer = withTracker(({ projectId }) => {
    const modelsHanlder = Meteor.subscribe('nlu_models.lite');
    const project = Projects.findOne({ _id: projectId }, {
        fields: {
            name: 1, namespace: 1, apiKey: 1, nlu_models: 1, defaultLanguage: 1,
        },
    });
    if (!project) return browserHistory.replace({ pathname: '/404' });
    const projectsHandler = Meteor.subscribe('projects', projectId);
    const ready = modelsHanlder.ready() && projectsHandler.ready();
    const modelLanguages = getNluModelLanguages(project.nlu_models, true);
    return {
        ready,
        project,
        modelLanguages,
    };
})(ProjectInfo);

const mapStateToProps = state => ({
    projectId: state.get('projectId'),
});

export default connect(mapStateToProps)(ProjectInfoContainer);
