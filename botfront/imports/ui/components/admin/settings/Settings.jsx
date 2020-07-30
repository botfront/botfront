import {
    Container, Tab, Message, Button, Header, Confirm, Segment,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import 'react-s-alert/dist/s-alert-default.css';
import {
    AutoForm, SubmitField, AutoField, ErrorsField,
} from 'uniforms-semantic';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { get } from 'lodash';
import { GlobalSettings } from '../../../../api/globalSettings/globalSettings.collection';
import { GlobalSettingsSchema } from '../../../../api/globalSettings/globalSettings.schema';
import AceField from '../../utils/AceField';
import { wrapMeteorCallback } from '../../utils/Errors';
import { PageMenu } from '../../utils/Utils';
import HttpRequestsForm from '../../common/HttpRequestsForm';
import { can } from '../../../../lib/scopes';
import MigrationControl from './MigrationControl';

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = { saving: false, confirmModalOpen: false, licenseInfo: {} };
    }

    componentDidMount() {
        Meteor.call('getLicenseInfo', wrapMeteorCallback((err, info) => {
            this.setState({ licenseInfo: info });
        }));
        const { params: { setting } = {}, router } = this.props;
        const { location: { pathname } } = router;
        if (setting && this.getSettingsPanes().findIndex(p => p.name === setting) < 0) {
            router.replace({ pathname: `${pathname.split('/settings')[0]}/settings` });
        }
    }

    setActiveTab = (index) => {
        const { router } = this.props;
        const { location: { pathname } } = router;
        router.push({ pathname: `${pathname.split('/settings')[0]}/settings/${this.getSettingsPanes()[index].name}` });
    };

    onSave = (settings, callback = () => {}) => {
        this.setState({ saving: true });
        Meteor.call(
            'settings.save',
            settings,
            wrapMeteorCallback((...args) => {
                this.setState({ saving: false });
                callback(...args);
            }, 'Settings saved'),
        );
    };

    renderSubmitButton = () => (
        <>
            <ErrorsField />
            {can('global-settings:w', { anyScope: true }) && (
                <SubmitField value='Save' className='primary' data-cy='save-button' />
            )}
        </>
    )

    renderSecurityPane = () => (
        <Tab.Pane>
            <Message
                info
                icon='question circle'
                content={(
                    <>
                        If you want to secure your login page with a Catpcha. &nbsp;
                        <a
                            target='_blank'
                            rel='noopener noreferrer'
                            href='https://developers.google.com/recaptcha'
                        >
                            Get your keys here
                        </a>
                        . Only v2 is supported.
                    </>
                )}
            />
            <AutoField name='settings.public.reCatpchaSiteKey' />
            <AutoField name='settings.private.reCatpchaSecretServerKey' />
            {this.renderSubmitButton()}
        </Tab.Pane>
    );

    renderDefaultNLUPipeline = () => (
        <Tab.Pane>
            <Message
                info
                icon='question circle'
                content='Default NLU pipeline for new NLU models'
            />
            <AceField name='settings.public.defaultNLUConfig' label='' convertYaml />
            {this.renderSubmitButton()}
        </Tab.Pane>
    );

    renderDefaultEndpoints = () => (
        <Tab.Pane>
            <Message
                info
                icon='question circle'
                content={(
                    <>
                        Default Rasa (see{' '}
                        <a
                            target='_blank'
                            rel='noopener noreferrer'
                            href='https://rasa.com/docs/core/server/#endpoint-configuration'
                        >
                            Rasa documentation
                        </a>
                        ) &nbsp;endpoints for new projects
                    </>
                )}
            />
            <AceField
                name='settings.private.defaultEndpoints'
                label=''
                convertYaml
            />
            {this.renderSubmitButton()}
        </Tab.Pane>
    );

    renderDefaultCredentials = () => (
        <Tab.Pane>
            <Message
                info
                icon='question circle'
                content={(
                    <>
                        Default Rasa (see{' '}
                        <a
                            target='_blank'
                            rel='noopener noreferrer'
                            href='https://rasa.com/docs/core/connectors/'
                        >
                            Rasa documentation
                        </a>
                        ) &nbsp;channel credentials for new projects
                    </>
                )}
            />
            <AceField
                name='settings.private.defaultCredentials'
                label=''
                convertYaml
            />
            {this.renderSubmitButton()}
        </Tab.Pane>
    );

    renderDefaultDefaultDomain = () => (
        <Tab.Pane>
            <Message
                info
                icon='question circle'
                content={<>Default default domain for new projects</>}
            />
            <AceField
                name='settings.private.defaultDefaultDomain'
                label=''
                convertYaml
            />
            {this.renderSubmitButton()}
        </Tab.Pane>
    );

    renderIntegrationSettings = () => (
        <Tab.Pane>
            <Header as='h3'>Links for Handoff setup</Header>
            <AutoField
                name='settings.private.integrationSettings.slackLink'
                label='Slack'
            />
            {this.renderSubmitButton()}
        </Tab.Pane>// //
    );

    renderAppearance = () => (
        <Tab.Pane>
            <Message
                info
                icon='question circle'
                content='Login page background images URLs'
            />
            <AutoField name='settings.public.backgroundImages' />
            <AutoField name='settings.public.logoUrl' />
            <AutoField name='settings.public.smallLogoUrl' />
            {this.renderSubmitButton()}
        </Tab.Pane>
    );

    renderMisc = () => {
        const { confirmModalOpen } = this.state;
        return (
            <>
                <Segment>
                    <AutoField name='settings.private.bfApiHost' label='Botfront API host' data-cy='docker-api-host' />
                    <AutoField name='settings.public.chitChatProjectId' label='Chitchat project Id' info='ID of project containing chitchat NLU training data' />
                    <AutoField name='settings.public.docUrl' />
                    <AutoField name='settings.public.intercomAppId' />
                    {this.renderSubmitButton()}
                </Segment>
                {can('global-admin') && (
                    <Segment>
                        <MigrationControl />
                        <Header>Rebuild search indices</Header>
                        <span>Only use this option if you&apos;re having issues with stories search.</span>
                        <br />
                        <br />
                        <Confirm
                            data-cy='rebuild-indices-confirm'
                            open={confirmModalOpen}
                            header='Rebuild search indices for all projects'
                            content='This is a safe action that runs in the background, but it may take some time.'
                            onCancel={() => this.setState({ confirmModalOpen: false })}
                            onConfirm={() => {
                                Meteor.call('global.rebuildIndexes');
                                this.setState({ confirmModalOpen: false });
                            }}
                        />
                        <Button
                            primary
                            onClick={(e) => {
                                e.preventDefault();
                                this.setState({ confirmModalOpen: true });
                            }}
                            data-cy='rebuild-button'
                        >
                        Rebuild
                        </Button>
                    </Segment>
                )}
            </>
        );
    }

    renderLicenseInfo = () => {
        const { licenseInfo } = this.state;
        return (
            <Tab.Pane>
                <Header as='h3'>License Information</Header>
                <p data-cy='license-expire'> <span className='bold-span'>Expire</span>: {(new Date(licenseInfo.exp * 1000)).toString()} </p>
                <p data-cy='license-project'> <span className='bold-span'>Projects quota</span>: {licenseInfo.projectsQuota === 0 ? 'unlimited' : licenseInfo.projectsQuota}</p>
                <p data-cy='license-user'> <span className='bold-span'>Users quota</span>: {licenseInfo.usersQuota === 0 ? 'unlimited' : licenseInfo.usersQuota}</p>
                <p data-cy='license-holder'> <span className='bold-span'>License holder</span>: {licenseInfo.holder}</p>
            </Tab.Pane>
        );
    };


    getSettingsPanes = () => {
        const { settings } = this.props;
        const panes = [
            { name: 'default-nlu-pipeline', menuItem: 'Default NLU Pipeline', render: this.renderDefaultNLUPipeline },
            { name: 'default-credentials', menuItem: 'Default credentials', render: this.renderDefaultCredentials },
            { name: 'default-endpoints', menuItem: 'Default endpoints', render: this.renderDefaultEndpoints },
            {
                name: 'default-default-domain',
                menuItem: 'Default default domain',
                render: this.renderDefaultDefaultDomain,
            },
            {
                name: 'webhooks',
                menuItem: 'Webhooks',
                render: () => (
                    <Tab.Pane>
                        <HttpRequestsForm
                            onSave={this.onSave}
                            path='settings.private.webhooks.'
                            urls={get(settings, 'settings.private.webhooks', {})}
                            editable={can('global-settings:w')}
                        />
                    </Tab.Pane>
                ),
            },
            {
                name: 'integration',
                menuItem: 'Integration',
                render: this.renderIntegrationSettings,
            },
            { name: 'security', menuItem: 'Security', render: this.renderSecurityPane },
            { name: 'appearance', menuItem: 'Appearance', render: this.renderAppearance },
            { name: 'misc', menuItem: 'Misc', render: this.renderMisc },
            { name: 'license', menuItem: 'License Information', render: this.renderLicenseInfo },
        ];

        return panes;
    };

    renderSettings = (saving, settings) => {
        const { params: { setting } = {} } = this.props;
        return (
            <>
                <PageMenu icon='setting' title='Global Settings' />
                <Container id='admin-settings' data-cy='admin-settings-menu'>
                    <AutoForm schema={new SimpleSchema2Bridge(GlobalSettingsSchema)} model={settings} onSubmit={this.onSave} disabled={saving || !can('global-settings:w', { anyScope: true })}>
                        <Tab
                            menu={{ vertical: true, 'data-cy': 'settings-menu' }}
                            grid={{ paneWidth: 13, tabWidth: 3 }}
                            panes={this.getSettingsPanes()}
                            activeIndex={setting ? this.getSettingsPanes().findIndex(p => p.name === setting) : 0}
                            onTabChange={(_, data) => {
                                if (this.getSettingsPanes()[data.activeIndex].name) this.setActiveTab(data.activeIndex);
                            }}
                        />
                    </AutoForm>
                </Container>
            </>
        );
    };

    renderLoading = () => <div />;

    render() {
        const { settings, ready } = this.props;
        const { saving, activePane } = this.state;
        if (ready) return this.renderSettings(saving, settings, activePane);
        return this.renderLoading();
    }
}

Settings.propTypes = {
    settings: PropTypes.object,
    projectId: PropTypes.string.isRequired,
    router: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    ready: PropTypes.bool.isRequired,
};

Settings.defaultProps = {
    settings: {},
};

const SettingsContainer = withTracker((props) => {
    const handler = Meteor.subscribe('settings');
    const settings = GlobalSettings.findOne({ _id: 'SETTINGS' });
    return {
        ready: handler.ready(),
        settings,
        ...props,
    };
})(Settings);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(SettingsContainer);
