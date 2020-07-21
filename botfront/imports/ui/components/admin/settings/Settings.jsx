import {
    Container, Tab, Message, Menu, Button, Header, Confirm, Segment,
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
import { GlobalSettings } from '../../../../api/globalSettings/globalSettings.collection';
import { GlobalSettingsSchema } from '../../../../api/globalSettings/globalSettings.schema';
import AceField from '../../utils/AceField';
import { wrapMeteorCallback } from '../../utils/Errors';
import { PageMenu } from '../../utils/Utils';
import MigrationControl from './MigrationControl';

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = { saving: false, confirmModalOpen: false };
    }

    componentDidMount() {
        const { params: { setting } = {}, router } = this.props;
        const { location: { pathname } } = router;
        if (setting && this.getSettingsPanes().findIndex(p => p.name === setting) < 0) {
            router.replace({ pathname: `${pathname.split('/global')[0]}/global` });
        }
    }

    setActiveTab = (index) => {
        const { router } = this.props;
        const { location: { pathname } } = router;
        router.push({ pathname: `${pathname.split('/global')[0]}/global/${this.getSettingsPanes()[index].name}` });
    };

    handleReturnToProjectSettings = () => {
        const { router, projectId } = this.props;
        router.push(`/project/${projectId}/settings`);
    }

    onSave = (settings) => {
        this.setState({ saving: true });
        Meteor.call('settings.save', settings, wrapMeteorCallback(() => this.setState({ saving: false }), 'Settings saved'));
    };

    renderSubmitButton = () => (
        <>
            <ErrorsField />
            <SubmitField value='Save' className='primary' data-cy='save-button' />
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
                        <a target='_blank' rel='noopener noreferrer' href='https://developers.google.com/recaptcha'>
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
            <Message info icon='question circle' content='Default NLU pipeline for new NLU models' />
            <AceField name='settings.public.defaultNLUConfig' label='' convertYaml />
            {this.renderSubmitButton()}
        </Tab.Pane>
    );

    renderAppearance = () => (
        <Tab.Pane>
            <Message info icon='question circle' content='Login page background images URLs' />
            <AutoField name='settings.public.backgroundImages' />
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
                    {this.renderSubmitButton()}
                </Segment>
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
            </>
        );
    }

    getSettingsPanes = () => {
        const { projectId } = this.props;
        let panes = [
            { name: 'default-nlu-pipeline', menuItem: 'Default NLU Pipeline', render: this.renderDefaultNLUPipeline },
            { name: 'security', menuItem: 'Security', render: this.renderSecurityPane },
            { name: 'appearance', menuItem: 'Appearance', render: this.renderAppearance },
            { name: 'misc', menuItem: 'Misc', render: this.renderMisc },
        ];

        if (projectId) {
            panes = [
                ...panes,
                {
                    menuItem: (
                        <Menu.Item
                            icon='backward'
                            content='Project Settings'
                            key='Project Settings'
                            onClick={this.handleReturnToProjectSettings}
                        />
                    ),
                },
            ];
        }
        return panes;
    };

    renderSettings = (saving, settings) => {
        const { params: { setting } = {} } = this.props;
        return (
            <>
                <PageMenu icon='setting' title='Global Settings' />
                <Container id='admin-settings' data-cy='admin-settings-menu'>
                    <AutoForm schema={new SimpleSchema2Bridge(GlobalSettingsSchema)} model={settings} onSubmit={this.onSave} disabled={saving}>
                        <Tab
                            menu={{ vertical: true }}
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
        const { saving } = this.state;
        if (ready) return this.renderSettings(saving, settings);
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
