import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import {
    Container, Icon, Menu,
} from 'semantic-ui-react';
import AutoForm from 'uniforms-semantic/AutoForm';
import React from 'react';
import 'react-s-alert/dist/s-alert-default.css';
import { find, cloneDeep } from 'lodash';
import { browserHistory } from 'react-router';
import {
    AutoField, SubmitField, ErrorsField, HiddenField,
} from 'uniforms-semantic';
import { connect } from 'react-redux';
import shortId from 'shortid';
import slugify from 'slugify';
import { TemplateSchema } from '../../../../api/project/response.schema';
import { Projects } from '../../../../api/project/project.collection';
import SequenceField from './SequenceField';
import TemplateValuesField from './TemplateValuesField';
import { getNluModelLanguages } from '../../../../api/nlu_model/nlu_model.utils';
import { wrapMeteorCallback } from '../../utils/Errors';
import TemplateValueItemField from './TemplateValueItemField';
import { setWorkingLanguage } from '../../../store/actions/actions';
import DisplayIf from '../../DisplayIf';

class Template extends React.Component {
    constructor(props) {
        super(props);

        const { workingLanguage, changeWorkingLanguage, languages } = this.props;

        if (!languages.includes(workingLanguage)) changeWorkingLanguage(languages[0]);
    }

    methodCallback = () => wrapMeteorCallback((err) => {
        if (!err) browserHistory.goBack();
    });

    generateKey = (template) => {
        const criteria = template.match.nlu[0];
        let key = [];
        key.push(criteria.intent);
        if (criteria.entities[0]) {
            key.push(criteria.entities[0].entity);
            key.push(criteria.entities[0].value);
        }
        key = key.join(' ').slice(0, 20);
        return slugify(['utter', key, shortId.generate()].join(' '), '_');
    };

    updateTemplate = (formData) => {
        let newTemplate = { ...formData };
        // Remove empty sequences (they were added for each possible languages by AutoForm)
        if (formData.value) {
            newTemplate = {
                ...formData,
                values: formData.value.filter(t => t.sequence.length > 0),
            };
        }

        const { projectId, template } = this.props;

        if (template) {
            Meteor.call('project.updateTemplate', projectId, template.key, newTemplate, this.methodCallback());
        } else {
            Meteor.call('project.insertTemplate', projectId, newTemplate, this.methodCallback());
        }
    };

    renderMenu = template => (
        <Menu pointing secondary style={{ background: '#fff' }}>
            <Menu.Item>
                <Menu.Header as='h3'>
                    <Icon name='comment alternate' />
                    {template && 'Edit bot response'}
                    {!template && 'Add bot response'}
                </Menu.Header>
            </Menu.Item>
        </Menu>
    );

    modelTransform = (mode, model) => {
        const { template } = this.props;
        const newModel = cloneDeep(model);
        // This means that the template is already in db,
        // thus we don't want to change the key
        if (template) {
            return newModel;
        }

        if (mode === 'validate' || mode === 'submit') {
            return {
                ...newModel,
                key: model.match ? this.generateKey(newModel) : newModel.key,
            };
        }
        return newModel;
    };

    renderContentFields = l => (
        <TemplateValuesField name='values' languages={l}>
            <TemplateValueItemField name='$'>
                <HiddenField name='lang' />
                <SequenceField name='sequence' />
            </TemplateValueItemField>
        </TemplateValuesField>
    );

    render() {
        const {
            template, languages: langs, edit,
        } = this.props;
        return (
            <>
                {this.renderMenu(template)}
                {(!edit || template) && (
                    <Container className='bot-response-form'>
                        <AutoForm schema={TemplateSchema} onSubmit={this.updateTemplate} model={template || {}} modelTransform={this.modelTransform}>
                            {/* <DisplayIf condition={context => context.model.match != null}>
                                <AutoField data-cy='response-name' name='key' className='tiny' label='Response name' placeholder='this will be auto generated' disabled />
                            </DisplayIf> */}
                            <DisplayIf condition={context => context.model.match == null}>
                                <AutoField data-cy='response-name' name='key' className='tiny' label='Response name' />
                            </DisplayIf>

                            <br />
                            <br />
                            <DisplayIf condition={context => context.model.match == null}>
                                <>
                                    {this.renderContentFields(langs)}
                                    <br />
                                </>
                            </DisplayIf>
                            <ErrorsField />
                            <SubmitField className='primary response-save-button' value='Save response' />
                        </AutoForm>
                    </Container>
                )}
            </>
        );
    }
}

Template.propTypes = {
    projectId: PropTypes.string.isRequired,
    languages: PropTypes.array.isRequired,
    template: PropTypes.object,
    workingLanguage: PropTypes.string,
    changeWorkingLanguage: PropTypes.func.isRequired,
    edit: PropTypes.bool.isRequired,
};

Template.defaultProps = {
    template: null,
    workingLanguage: null,
};

const TemplateContainer = withTracker((props) => {
    const {
        params: { project_id: projectId, template_id: templateId },
        router,
    } = props;
    const project = Projects.find({ _id: projectId }, { fields: { templates: 1, nlu_models: 1 } }).fetch();
    if (!project) return router.replace('/404');
    const template = find(project[0].templates, { key: templateId });
    return {
        edit: !!templateId,
        projectId,
        template,
        languages: getNluModelLanguages(project[0].nlu_models),
    };
})(Template);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
    workingLanguage: state.settings.get('workingLanguage'),
});

const mapDispatchToProps = {
    changeWorkingLanguage: setWorkingLanguage,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(TemplateContainer);
