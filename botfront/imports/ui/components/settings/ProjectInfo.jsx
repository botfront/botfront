/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/label-has-for */
import React from 'react';
import {
    AutoForm,
    SubmitField,
    ErrorsField,
    LongTextField,
    AutoField,
} from 'uniforms-semantic';
import {
    Dropdown, Form, Message, Icon, Segment,
} from 'semantic-ui-react';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { ProjectsSchema } from '../../../api/project/project.schema';
import { ProjectContext } from '../../layouts/context';
import InfoField from '../utils/InfoField';
import { wrapMeteorCallback } from '../utils/Errors';
import SelectField from '../form_fields/SelectField';
import { languages } from '../../../lib/languages';
import { Info } from '../common/Info';
import { can } from '../../../lib/scopes';

class ProjectInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            saving: false,
            value: [],
            model: {},
        };
    }

    componentDidMount() {
        const { projectLanguages, project } = this.context;
        this.setState({ value: projectLanguages.map(l => l.value) });
        this.setState({ model: project });
    }

    getOptions = () => {
        const renderOptions = Object.keys(languages).map(code => ({
            text: languages[code].name,
            key: code,
            value: code,
        }));
        return renderOptions;
    };

    renderLabel = (language) => {
        const { projectLanguages } = this.context;
        const isModelExist = projectLanguages.some(l => l.value === language.value);
        const label = {
            color: isModelExist ? 'blue' : 'green',
            content: `${language.text}`,
        };
        if (!isModelExist) return label;
        label.removeIcon = '';
        return label;
    };

    onChange = (e, { value: newValue }) => {
        this.setState({ saving: false, value: newValue });
    };

    createNLUModels = (languageArray, projectId) => {
        const nluInsertArray = languageArray.map(language => Meteor.callWithPromise('nlu.insert', projectId, language));
        Promise.all(nluInsertArray).then(() => {
            this.setState({ saving: false });
        });
    };

    onSave = (project) => {
        const { value } = this.state;
        const { projectLanguages } = this.context;
        const {
            name,
            _id,
            defaultLanguage,
            gitString,
            publicSshKey,
            privateSshKey,
        } = project;
        const notInprojectLanguages = value.filter(
            el => !projectLanguages.some(l => l.value === el),
        );
        this.setState({ saving: true });
        Meteor.call(
            'project.update',
            {
                name,
                _id,
                defaultLanguage,
                ...(gitString ? { gitString } : {}),
                ...(publicSshKey ? { publicSshKey } : {}),
                ...(privateSshKey ? { privateSshKey } : {}),
            },
            wrapMeteorCallback((err) => {
                if (!err) {
                    this.createNLUModels(notInprojectLanguages, _id);
                }
            }, 'Changes saved'),
        );
    };

    renderDeleteprojectLanguages = () => (
        <Message
            size='tiny'
            info
            content={(
                <>
                    To remove a language from the project, go to{' '}
                    <strong> NLU &gt; Settings &gt; Delete </strong>.
                </>
            )}
        />
    );

    static contextType = ProjectContext;

    render() {
        const {
            projectLanguages,
            project: { _id: projectId },
        } = this.context;
        const { saving, value, model } = this.state;
        const bridge = new SimpleSchema2Bridge(ProjectsSchema);
        return (
            <>
                <AutoForm
                    schema={bridge}
                    model={model}
                    onSubmit={updateProject => this.onSave(updateProject)}
                    disabled={saving}
                >
                    <InfoField name='name' label='Name' className='project-name' />
                    <Form.Field>
                        <label>Languages supported</label>
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
                            renderLabel={language => this.renderLabel(language)}
                            data-cy='language-selector'
                        />
                        {!!projectLanguages.length && this.renderDeleteprojectLanguages()}
                    </Form.Field>
                    {!!projectLanguages.length && (
                        <SelectField
                            name='defaultLanguage'
                            options={projectLanguages}
                            className='project-default-language'
                            data-cy='default-langauge-selection'
                        />
                    )}
                    {can('projects:w', projectId) && (
                        <Segment className='project-name field'>
                            <InfoField
                                name='gitString'
                                label={(
                                    <>
                                        <Icon name='git' />
                                        Git repository
                                    </>
                                )}
                                info={(
                                    <span className='small'>
                                        Use format{' '}
                                        <span className='monospace'>
                                            https:// user:token@domain/.../
                                            repo.git#branch
                                        </span>{' '}
                                        or{' '}
                                        <span className='monospace'>
                                            git@domain:.../repo.git#branch
                                        </span>
                                        .
                                    </span>
                                )}
                                className='project-name'
                                data-cy='git-string'
                            />
                            <label>
                                <Icon name='key' /> SSH keys{' '}
                                <Info info='These are stored as is, so use caution: use this key only for versioning your bot, and give it only the necessary rights to push and pull to above repo.' />
                            </label>
                            <AutoField
                                label='Public'
                                name='publicSshKey'
                                className='project-name'
                                data-cy='public-ssh-key'
                            />
                            <LongTextField
                                label='Private'
                                name='privateSshKey'
                                className='project-name'
                                data-cy='private-ssh-key'
                            />
                        </Segment>
                    )}
                    <br />
                    <ErrorsField />
                    <SubmitField
                        className='primary save-project-info-button'
                        value='Save Changes'
                        data-cy='save-changes'
                    />
                </AutoForm>
            </>
        );
    }
}

ProjectInfo.propTypes = {};

export default ProjectInfo;
