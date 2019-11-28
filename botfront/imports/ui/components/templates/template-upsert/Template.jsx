import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import {
    Container, Icon, Menu,
} from 'semantic-ui-react';
import AutoForm from 'uniforms-semantic/AutoForm';
import React from 'react';
import 'react-s-alert/dist/s-alert-default.css';
import { cloneDeep } from 'lodash';
import { browserHistory } from 'react-router';
import {
    AutoField, SubmitField, ErrorsField, HiddenField,
} from 'uniforms-semantic';
import { connect } from 'react-redux';
import shortId from 'shortid';
import slugify from 'slugify';
import { useQuery } from '@apollo/react-hooks';
import { TemplateSchema } from '../../../../api/project/response.schema';
import { Projects } from '../../../../api/project/project.collection';
import SequenceField from './SequenceField';
import TemplateValuesField from './TemplateValuesField';
import { getNluModelLanguages } from '../../../../api/nlu_model/nlu_model.utils';
import { wrapMeteorCallback } from '../../utils/Errors';
import TemplateValueItemField from './TemplateValueItemField';
import { setWorkingLanguage } from '../../../store/actions/actions';
import DisplayIf from '../../DisplayIf';
import { GET_BOT_RESPONSE } from '../../stories/graphQL/queries';
import { Loading } from '../../utils/Utils';


function Template(props) {
    const {
        workingLanguage,
        changeWorkingLanguage,
        languages,
        projectId,
        template,
        edit,
    } = props;
    if (!languages.includes(workingLanguage)) changeWorkingLanguage(languages[0]);

    const methodCallback = () => wrapMeteorCallback((err) => {
        if (!err) browserHistory.goBack();
    });

    const generateKey = (aTemplate) => {
        const criteria = aTemplate.match.nlu[0];
        let key = [];
        key.push(criteria.intent);
        if (criteria.entities[0]) {
            key.push(criteria.entities[0].entity);
            key.push(criteria.entities[0].value);
        }
        key = key.join(' ').slice(0, 20);
        return slugify(['utter', key, shortId.generate()].join(' '), '_');
    };

    const updateTemplate = (formData) => {
        let newTemplate = { ...formData };
        // Remove empty sequences (they were added for each possible languages by AutoForm)
        if (formData.value) {
            newTemplate = {
                ...formData,
                values: formData.value.filter(t => t.sequence.length > 0),
            };
        }

        if (template) {
            Meteor.call('project.updateTemplate', projectId, template.key, newTemplate, methodCallback());
        } else {
            Meteor.call('project.insertTemplate', projectId, newTemplate, methodCallback());
        }
    };

    const renderMenu = aTemplate => (
        <Menu pointing secondary style={{ background: '#fff' }}>
            <Menu.Item>
                <Menu.Header as='h3'>
                    <Icon name='comment alternate' />
                    {aTemplate && 'Edit bot response'}
                    {!aTemplate && 'Add bot response'}
                </Menu.Header>
            </Menu.Item>
        </Menu>
    );

    const modelTransform = (mode, model) => {
        const newModel = cloneDeep(model);
        // This means that the template is already in db,
        // thus we don't want to change the key
        if (template) {
            return newModel;
        }

        if (mode === 'validate' || mode === 'submit') {
            return {
                ...newModel,
                key: model.match ? generateKey(newModel) : newModel.key,
            };
        }
        return newModel;
    };

    const renderContentFields = l => (
        <TemplateValuesField name='values' languages={l}>
            <TemplateValueItemField name='$'>
                <HiddenField name='lang' />
                <SequenceField name='sequence' />
            </TemplateValueItemField>
        </TemplateValuesField>
    );

    
    return (
        <>
            {renderMenu(template)}
            {(!edit || template) && (
                <Container className='bot-response-form'>
                    <AutoForm schema={TemplateSchema} onSubmit={updateTemplate} model={template || {}} modelTransform={modelTransform}>
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
                                {renderContentFields(languages)}
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

const TemplateContainer = (props) => {
    const {
        params: { project_id: projectId, template_id: templateId },
        router,
        changeWorkingLanguage,
        workingLanguage,
    } = props;
   
    const project = Projects.find({ _id: projectId }, { fields: { nlu_models: 1 } }).fetch();
    if (!project) return router.replace('/404');
    const {
        loading, error, data,
    } = useQuery(GET_BOT_RESPONSE, { variables: { projectId, key: templateId, lang: workingLanguage || 'en' } });
    const componentsProps = ({
        workingLanguage,
        changeWorkingLanguage,
        projectId,
        edit: !!templateId,
        languages: getNluModelLanguages(project[0].nlu_models),
    });
    if (!loading && !error) {
        componentsProps.template = data.botResponse;
    }
    
    return (
        <Loading loading={loading}>
            <Template {...componentsProps} />
        </Loading>
    );
};


TemplateContainer.propTypes = {
    params: PropTypes.object.isRequired,
    router: PropTypes.string.isRequired,
    workingLanguage: PropTypes.string,
    changeWorkingLanguage: PropTypes.func.isRequired,
};

TemplateContainer.defaultProps = {
    workingLanguage: null,
};

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
