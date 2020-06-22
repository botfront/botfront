import {
    Container, Tab, Message, Grid,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import 'react-s-alert/dist/s-alert-default.css';
import {
    AutoForm, ErrorsField, SubmitField, AutoField,
} from 'uniforms-semantic';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { get } from 'lodash';
import { GlobalSettings } from '../../../../api/globalSettings/globalSettings.collection';
import { GlobalSettingsSchema } from '../../../../api/globalSettings/globalSettings.schema';
import AceField from '../../utils/AceField';
import { wrapMeteorCallback } from '../../utils/Errors';
import { PageMenu } from '../../utils/Utils';
import WebhooksForm from './WebhooksForm';
import { can } from '../../../../lib/scopes';

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = { saving: false };
    }

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
                fontSize={12}
                convertYaml
            />
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
                fontSize={12}
                convertYaml
            />
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
                fontSize={12}
                convertYaml
            />
        </Tab.Pane>
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
        </Tab.Pane>
    );

    renderMisc = () => (
        <Tab.Pane>
            <AutoField name='settings.private.bfApiHost' label='Botfront API host' data-cy='docker-api-host' />
            <AutoField name='settings.public.chitChatProjectId' label='Chitchat project Id' info='ID of project containing chitchat NLU training data' />
            <AutoField name='settings.public.docUrl' />
            <AutoField name='settings.public.intercomAppId' />
        </Tab.Pane>
    );

    getSettingsPanes = () => {
        const { settings } = this.props;
        const panes = [
            { menuItem: 'Default NLU Pipeline', render: this.renderDefaultNLUPipeline },
            { menuItem: 'Default credentials', render: this.renderDefaultCredentials },
            { menuItem: 'Default endpoints', render: this.renderDefaultEndpoints },
            {
                menuItem: 'Default default domain',
                render: this.renderDefaultDefaultDomain,
            },
            {
                menuItem: 'Webhooks',
                render: () => (
                    <Tab.Pane>
                        <WebhooksForm
                            onSave={this.onSave}
                            path='settings.private.webhooks.'
                            webhooks={get(settings, 'settings.private.webhooks', {})}
                            editable={can('global-settings:w')}
                        />
                    </Tab.Pane>
                ),
            },
            { menuItem: 'Security', render: this.renderSecurityPane },
            { menuItem: 'Appearance', render: this.renderAppearance },
            { menuItem: 'Misc', render: this.renderMisc },
        ];

        return panes;
    };

    renderSettings = (saving, settings, activePane) => (
        <>
            <PageMenu icon='setting' title='Global Settings' />
            <Container id='admin-settings' data-cy='admin-settings-menu'>
                <AutoForm schema={new SimpleSchema2Bridge(GlobalSettingsSchema)} model={settings} onSubmit={this.onSave} disabled={saving || !can('global-settings:w', { anyScope: true })}>
                    <Tab
                        menu={{ vertical: true }}
                        grid={{ paneWidth: 13, tabWidth: 3 }}
                        panes={this.getSettingsPanes()}
                        onTabChange={(_e, { activeIndex }) => this.setState({
                            activePane: this.getSettingsPanes()[activeIndex].menuItem,
                        })}
                    />
                    <br />
                    <Grid>
                        <Grid.Row>
                            <Grid.Column width={3} />
                            <Grid.Column width={13}>
                                <ErrorsField />
                                { activePane !== 'Webhooks' && can('global-settings:w', { anyScope: true }) && <SubmitField data-cy='save-global-settings' value='Save' className='primary' />}
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </AutoForm>
            </Container>
        </>
    );

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
