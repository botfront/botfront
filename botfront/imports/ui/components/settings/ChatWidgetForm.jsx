import React from 'react';
import {
    Message,
    Accordion,
    Icon,
    Form,
    Input,
    Header,
    Divider,
    Button,
    Select,
    Menu,
    Loader,
} from 'semantic-ui-react';
import {
    AutoField, AutoForm, LongTextField, ErrorsField,
} from 'uniforms-semantic';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import { cloneDeep } from 'lodash';
import PropTypes from 'prop-types';
import { safeLoad } from 'js-yaml';
import ToggleField from '../common/ToggleField';
import SelectField from '../form_fields/SelectField';
import { Credentials as CredentialsCollection } from '../../../api/credentials';
import { chatWidgetSettingsSchema } from '../../../api/project/project.schema';
import { wrapMeteorCallback } from '../utils/Errors';
import 'react-s-alert/dist/s-alert-default.css';
import SaveButton from '../utils/SaveButton';
import { can } from '../../../lib/scopes';
import ChangesSaved from '../utils/ChangesSaved';
import IntentField from '../form_fields/IntentField';
import { ProjectContext } from '../../layouts/context';
import InfoField from '../utils/InfoField';

const ColorField = React.lazy(() => import('../form_fields/ColorField'));
class ChatWidgetForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            saving: false,
            saved: false,
            copied: false,
            advancedVisible: false,
            showConfirmation: false,
            selectedEnvironment: 'development',
            activeMenu: 'Configuration',
        };
    }

    componentDidMount() {
        const {
            project: { defaultLanguage, chatWidgetSettings = {}, _id: projectId },
        } = this.context;
        if (
            chatWidgetSettings
            && chatWidgetSettings.customData
            && !chatWidgetSettings.customData.language
        ) {
            Meteor.call('project.update', {
                _id: projectId,
                chatWidgetSettings: {
                    ...chatWidgetSettings,
                    customData: { language: `${defaultLanguage}` },
                },
            });
        }
    }

    componentWillUnmount() {
        clearTimeout(this.successTimeout);
    }

    getSnippetString() {
        const { credentials } = this.props;
        const {
            project: { chatWidgetSettings = {} },
        } = this.context;
        const { selectedEnvironment } = this.state;
        const credential = safeLoad(credentials[selectedEnvironment]);
        const channel = credential['rasa_addons.core.channels.webchat.WebchatInput'];
        // eslint-disable-next-line max-len
        const snippet = `<script>!function(){let e=document.createElement("script"),t=document.head||document.getElementsByTagName("head")[0];e.src="https://storage.googleapis.com/cdn.botfront.cloud/botfront-widget-latest.js",e.async=!0,e.onload=(()=>{window.RasaWebchatPro({customData:${JSON.stringify(
            chatWidgetSettings.customData,
        )},socketUrl:"${
            channel.base_url
        }"})}),t.insertBefore(e,t.firstChild)}();</script>`;
        return snippet;
    }

    toogleAdvanced = () => {
        const { advancedVisible } = this.state;
        this.setState({ advancedVisible: !advancedVisible });
    };

    onSave = (settings) => {
        const newSettings = settings;
        const { projectId } = this.props;
        newSettings.customData = JSON.parse(newSettings.customData);
        const { initPayload } = newSettings;
        if (initPayload) {
            newSettings.initPayload = initPayload.startsWith('/')
                ? initPayload
                : `/${initPayload}`;
        }
        this.setState({ saving: true, showConfirmation: false });
        clearTimeout(this.successTimeout);

        Meteor.call(
            'project.update',
            {
                _id: projectId,
                chatWidgetSettings: newSettings,
            },
            wrapMeteorCallback((err) => {
                if (!err) {
                    this.setState({ saved: true });
                    this.successTimeout = setTimeout(() => {
                        this.setState({ saved: false });
                    }, 2 * 1000);
                }
                this.setState({ saving: false, showConfirmation: true });
            }),
        );
    };

    // eslint-disable-next-line class-methods-use-this
    copySnippet = () => {
        const copyText = document.getElementById('snippet');
        copyText.select();
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
    };

    handleCopy = () => {
        this.copySnippet();
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 1000);
    };

    handleEnvClick = (e, { name }) => this.setState({ selectedEnvironment: name });

    renderInstall = () => {
        const { copied, selectedEnvironment } = this.state;
        const {
            project: { deploymentEnvironments: availableEnvs = [] },
        } = this.context;
        return (
            <>
                <Message info content='Paste this snippet in your html' />
                <Form>
                    <Input
                        action
                        value={this.getSnippetString()}
                        id='snippet'
                        fluid
                        className='copiable-code'
                    >
                        <input />

                        {availableEnvs && availableEnvs.length > 0 && (
                            <Select
                                options={['development', ...availableEnvs].map(env => ({
                                    value: env,
                                    text: env,
                                }))}
                                onChange={(e, data) => {
                                    this.setState({ selectedEnvironment: data.value });
                                }}
                                value={selectedEnvironment}
                                data-cy='envs-selector'
                            />
                        )}

                        <Button
                            positive={copied}
                            onClick={(e) => {
                                e.preventDefault();
                                this.handleCopy();
                            }}
                            className='copy-button'
                            icon='copy'
                            content={copied ? 'Copied' : 'Copy'}
                        />
                    </Input>
                </Form>
            </>
        );
    };

    renderWidgetSettings = (saving, settings, projectId) => {
        const { saved, advancedVisible, showConfirmation } = this.state;
        const { projectLanguages } = this.context;
        return (
            <>
                <Message
                    info
                    icon='question circle'
                    content='Those settings are only used for the Webchat Plus channel'
                />
                <AutoForm
                    disabled={!!saving || !can('projects:w', projectId)}
                    schema={new SimpleSchema2Bridge(chatWidgetSettingsSchema)}
                    model={settings}
                    onSubmit={this.onSave}
                    modelTransform={(mode, model) => {
                        const newModel = cloneDeep(model);

                        if (
                            typeof newModel.customData !== 'string'
                            || newModel.customData === ''
                        ) {
                            newModel.customData = JSON.stringify(
                                newModel.customData || {},
                            );
                        }

                        if (mode === 'validate' || mode === 'submit') {
                            newModel.projectId = projectId;
                        }

                        return newModel;
                    }}
                >
                    <Divider />

                    <Header as='h3'>General</Header>
                    <AutoField label='Widget tile' name='title' data-cy='widget-title' />
                    <AutoField label='Widget subtile' name='subtitle' />
                    <InfoField
                        required={false}
                        info='The payload that will be sent when a user opens the chat window. The response to this payload is an introductory message'
                        Component={IntentField}
                        label='Initial payload'
                        name='initPayload'
                    />
                    <SelectField
                        options={projectLanguages}
                        name='customData'
                        label='Language'
                    />
                    <ErrorsField />
                    <Divider />

                    <Header as='h3'>Colors</Header>
                    <ColorField label='Main webchat color' name='mainColor' />
                    <ColorField
                        label='Conversation background color'
                        name='conversationBackgroundColor'
                    />
                    <ColorField label='User message text color' name='userTextColor' />
                    <ColorField
                        label='User message background color'
                        name='userBackgroundColor'
                    />
                    <ColorField
                        label='Assistant message text color'
                        name='assistTextColor'
                    />
                    <ColorField
                        label='Assistant message background color'
                        name='assistBackgoundColor'
                    />

                    <Divider />

                    <Accordion>
                        <Accordion.Title
                            active={advancedVisible}
                            index={0}
                            onClick={this.toogleAdvanced}
                        >
                            <Header as='h3' icon>
                                {' '}
                                <Icon name='dropdown' />
                                Advanced
                            </Header>
                        </Accordion.Title>
                        <Accordion.Content active={advancedVisible}>
                            <AutoField
                                label='User input hint'
                                name='inputTextFieldHint'
                            />
                            <ToggleField
                                label='Show full screen button'
                                name='showFullScreenButton'
                            />
                            <InfoField
                                label='Display unread messages count'
                                required={false}
                                info='If set, the number of unread message will be displayer next to the chat icon'
                                Component={ToggleField}
                                name='displayUnreadCount'
                            />
                            <InfoField
                                label='Hide when not connected'
                                required={false}
                                info='If set, the widget will remain hidden if it cannot connect to Botfront'
                                Component={ToggleField}
                                name='hideWhenNotConnected'
                            />
                            <InfoField
                                label='Disable tooltips'
                                required={false}
                                info='If set, messages will not appear as a bubble when the widget is closed'
                                Component={ToggleField}
                                name='disableTooltips'
                            />
                            <InfoField
                                label='Automatically clear the cache'
                                required={false}
                                info='If set, an user re-connecting after 30 will be start with a new session'
                                Component={ToggleField}
                                name='autoClearCache'
                            />
                            <InfoField
                                required={false}
                                info='Display a timestamp next to every message'
                                Component={ToggleField}
                                label='Display message timestamp'
                                name='showMessageDate'
                            />
                            <Divider />
                            <AutoField
                                label='Open launcher image'
                                name='openLauncherImage'
                            />
                            <AutoField label='Close launcher image' name='closeImage' />
                            <AutoField label='Avatar path' name='profileAvatar' />
                            <Divider />
                            <LongTextField
                                className='monospaced'
                                label='Default highlight class name'
                                name='defaultHighlightClassname'
                            />
                            <LongTextField
                                className='monospaced'
                                label='Default highlight css'
                                name='defaultHighlightCss'
                            />
                            <LongTextField
                                className='monospaced'
                                label='Default highlight css animation'
                                name='defaultHighlightAnimation'
                            />
                        </Accordion.Content>
                    </Accordion>
                    <br />
                    {showConfirmation && (
                        <ChangesSaved
                            onDismiss={() => this.setState({ saved: false, showConfirmation: false })
                            }
                        />
                    )}
                    <SaveButton
                        saved={saved}
                        saving={saving}
                        disabled={!!saving || !can('projects:w', projectId)}
                    />
                </AutoForm>
            </>
        );
    };

    renderLoading = () => <div />;

    renderContents = () => {
        const { saving, activeMenu } = this.state;
        const {
            project: { chatWidgetSettings = {}, _id: projectId },
        } = this.context;
        const { initPayload } = chatWidgetSettings;
        if (initPayload) {
            chatWidgetSettings.initPayload = initPayload.startsWith('/')
                ? initPayload.slice(1)
                : initPayload;
        }
        if (activeMenu === 'Configuration') {
            return this.renderWidgetSettings(saving, chatWidgetSettings, projectId);
        }
        return this.renderInstall();
    };

    handleMenuClick = (e, { name }) => this.setState({ activeMenu: name });

    static contextType = ProjectContext;

    render() {
        const { ready } = this.props;
        const { activeMenu } = this.state;
        if (ready) {
            return (
                <>
                    <Menu pointing secondary>
                        <Menu.Item
                            name='Configuration'
                            active={activeMenu === 'Configuration'}
                            onClick={this.handleMenuClick}
                        />
                        <Menu.Item
                            data-cy='install'
                            name='Installation'
                            active={activeMenu === 'Installation'}
                            onClick={this.handleMenuClick}
                        />
                    </Menu>
                    <React.Suspense fallback={<Loader />}>
                        {this.renderContents()}
                    </React.Suspense>
                </>
            );
        }
        return this.renderLoading();
    }
}

ChatWidgetForm.propTypes = {
    projectId: PropTypes.string.isRequired,
    credentials: PropTypes.object.isRequired,
    ready: PropTypes.bool.isRequired,
};

ChatWidgetForm.defaultProps = {};

const widgetSettingsContainer = withTracker(({ projectId }) => {
    const handlerCredentials = Meteor.subscribe('credentials', projectId);
    const handlerProject = Meteor.subscribe('projects', projectId);
    const credentials = {};
    CredentialsCollection.find(
        { projectId },
        { fields: { credentials: true, environment: true } },
    )
        .fetch()
        .forEach((credential) => {
            const env = credential.environment || 'development';
            credentials[env] = credential.credentials;
        });

    return {
        ready: handlerCredentials.ready() && handlerProject.ready(),
        credentials,
    };
})(ChatWidgetForm);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(widgetSettingsContainer);
