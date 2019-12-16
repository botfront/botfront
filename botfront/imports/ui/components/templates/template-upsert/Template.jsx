import PropTypes from 'prop-types';
import {
    Container, Icon, Menu,
} from 'semantic-ui-react';
import AutoForm from 'uniforms-semantic/AutoForm';
import React, { useState, useEffect } from 'react';
import Alert from 'react-s-alert';
import 'react-s-alert/dist/s-alert-default.css';
import { cloneDeep } from 'lodash';
import { browserHistory } from 'react-router';
import {
    AutoField, SubmitField, ErrorsField, HiddenField,
} from 'uniforms-semantic';
import { connect } from 'react-redux';
import shortId from 'shortid';
import slugify from 'slugify';
import { useLazyQuery, useMutation } from '@apollo/react-hooks';
import { TemplateSchema } from '../../../../api/project/response.schema';
import { Projects } from '../../../../api/project/project.collection';
import SequenceField from './SequenceField';
import TemplateValuesField from './TemplateValuesField';
import { getNluModelLanguages } from '../../../../api/nlu_model/nlu_model.utils';
import TemplateValueItemField from './TemplateValueItemField';
import { setWorkingLanguage } from '../../../store/actions/actions';
import DisplayIf from '../../DisplayIf';
import { GET_BOT_RESPONSE, GET_BOT_RESPONSES, GET_BOT_RESPONSE_BY_ID } from '../templates-list/queries';
import { CREATE_BOT_RESPONSE, UPDATE_BOT_RESPONSE } from '../../../layouts/graphQL/mutations';
import { Loading } from '../../utils/Utils';
import { clearTypenameField } from '../../../../lib/utils';

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
    const [createBotResponse] = useMutation(CREATE_BOT_RESPONSE);
    const [updateBotResponse] = useMutation(UPDATE_BOT_RESPONSE);
    const [submitAllowed, setSubmitAllowed] = useState(true);

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

    const displayError = (error, key) => {
        if (error.graphQLErrors[0]
            && error.graphQLErrors[0].extensions
            && error.graphQLErrors[0].extensions.exception
            && error.graphQLErrors[0].extensions.exception.code
            && error.graphQLErrors[0].extensions.exception.code === 11000) {
            Alert.error(`Error: the key: ${key} already exist in this project`, {
                position: 'bottom',
                timeout: 5 * 1000,
            });
        } else {
            Alert.error(error, {
                position: 'bottom',
                timeout: 5 * 1000,
            });
        }
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
        if (template && Object.keys(template).length > 0) {
            updateBotResponse({
                variables: { projectId, response: clearTypenameField(newTemplate), _id: template._id },
                refetchQueries: [{ query: GET_BOT_RESPONSE_BY_ID, variables: { _id: template._id } },
                    { query: GET_BOT_RESPONSES, variables: { projectId } }],
            }).then(() => { browserHistory.goBack(); },
                (error) => { displayError(error, newTemplate.key); });
        } else {
            createBotResponse({
                variables: { projectId, response: clearTypenameField(newTemplate) },
                refetchQueries: [{ query: GET_BOT_RESPONSE, variables: { projectId, key: newTemplate.key, lang: workingLanguage || 'en' } },
                    { query: GET_BOT_RESPONSES, variables: { projectId } }],
            }).then(() => { browserHistory.goBack(); },
                (error) => { displayError(error, newTemplate.key); });
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

    const enableSubmit = (allow) => {
        setSubmitAllowed(allow);
    };
    const renderContentFields = l => (
        <TemplateValuesField name='values' languages={l}>
            <TemplateValueItemField name='$'>
                <HiddenField name='lang' />
                <SequenceField enableSubmit={enableSubmit} name='sequence' />
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
                        <SubmitField className='primary response-save-button' value='Save response' disabled={!submitAllowed} />
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

    const [template, setTemplate] = useState({});


    const project = Projects.find({ _id: projectId }, { fields: { nlu_models: 1 } }).fetch();
    if (!project) return router.replace('/404');


    const [getResponse, { called, loading, data }] = useLazyQuery(GET_BOT_RESPONSE, {
        variables: { projectId, key: templateId, lang: workingLanguage || 'en' },
    });


    const componentsProps = ({
        workingLanguage,
        changeWorkingLanguage,
        projectId,
        edit: !!templateId,
        languages: getNluModelLanguages(project[0].nlu_models),
    });

    useEffect(() => {
        if (templateId) {
            getResponse();
        }
    }, []);

    useEffect(() => {
        if (templateId && called && !loading) {
            setTemplate(data.botResponse);
        }
    }, [data]);


    return (
        <Loading loading={loading}>
            <Template {...componentsProps} template={template} />
        </Loading>
    );
};


TemplateContainer.propTypes = {
    params: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired,
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
