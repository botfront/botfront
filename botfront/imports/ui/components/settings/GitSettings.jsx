
import {
    AutoForm, LongTextField, ErrorsField, AutoField,
} from 'uniforms-semantic';
import { withTracker } from 'meteor/react-meteor-data';
import 'react-s-alert/dist/s-alert-default.css';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import {
    Icon,
} from 'semantic-ui-react';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { GitSettingsSchema } from '../../../api/project/project.schema';
import { Projects } from '../../../api/project/project.collection';
import { wrapMeteorCallback } from '../utils/Errors';
import { can } from '../../../lib/scopes';
import InfoField from '../utils/InfoField';
import { Info } from '../common/Info';
import SaveButton from '../utils/SaveButton';
import { Button } from 'semantic-ui-react'

class GitSettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = { saving: false, saved: false, hidden: true };
    }

    

    componentWillUnmount() {
        clearTimeout(this.successTimeout);
    }

    hideCreds = (hidden = true) => {
        this.setState({hidden})
    }

    onSave = (gitSettings) => {
        const { projectId } = this.props;
        this.setState({ saving: true });
        clearTimeout(this.successTimeout);
        Meteor.call(
            'project.update',
            { _id: projectId, gitSettings },
            wrapMeteorCallback((err) => {
                if (!err) {
                    this.setState({ saved: true });
                    this.successTimeout = setTimeout(() => {
                        this.setState({ saved: false });
                        this.hideCreds(true)
                    }, 2 * 1000);
                    
                }
                this.setState({ saving: false });
                
            }),
        );
    };

    gitSettingsEmpty = (gitSettings) => { 
        if (!gitSettings) return true
        return Object.values(gitSettings).every(val => !val)
    }
   

    renderGitSettings = () => {
        const { gitSettings, projectId } = this.props;
        const { saving, saved, hidden } = this.state;
        const bridge = new SimpleSchema2Bridge(GitSettingsSchema);
        const hasWritePermission = can('git-credentials:w', projectId);
        const obfuscation = { 
        //we use this obfuscation because it matches the  validation regex, thus no error are shown when obfuscating
        gitString: 'https://******:******@******.******#******', 
        publicSshKey: '**********************', 
        privateSshKey:'**********************'
    }
        const isGitSettingsEmpty = this.gitSettingsEmpty(gitSettings)
        return (
            <>
            
          
            <AutoForm
                className='git-settings-form'
                schema={bridge}
                model={hidden && !isGitSettingsEmpty ? obfuscation : gitSettings}
                onSubmit={updateProject => this.onSave(updateProject)}
                disabled={saving || !hasWritePermission}
            >
                <InfoField
                    disabled={saving || !hasWritePermission}
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
                            <span className='monospace break-word'>
                        https://user:token@domain/org/repo.git#branch
                            </span>{' '}
                    or{' '}
                            <span className='monospace break-word'>
                        git@domain:org/repo.git#branch
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
                { !hidden && <ErrorsField /> }
              
                {hasWritePermission && (!hidden || isGitSettingsEmpty) && <SaveButton saved={saved} saving={saving} />}
                {!isGitSettingsEmpty  ? <Button  
            className='reveal-hide'
            data-cy='reveal-button' 
            floated='right'
            onClick={(e)=>{ e.preventDefault(); this.hideCreds(!hidden)}}> 
                {hidden ? 'Reveal ': 'Hide' }
            </Button>
            : <></>}
                
            </AutoForm>
            </>
        );
    };

    renderLoading = () => <div />;

    render() {
        const { ready } = this.props;
        if (ready) return this.renderGitSettings();
        return this.renderLoading();
    }
}

GitSettings.propTypes = {
    projectId: PropTypes.string.isRequired,
    gitSettings: PropTypes.object.isRequired,
    ready: PropTypes.bool.isRequired,
};

const GitSettingsContainer = withTracker(({ projectId }) => {
    const handler = Meteor.subscribe('projects', projectId);
    const { gitSettings } = Projects.findOne({ _id: projectId }) || { publicSshKey: '', privateSshKey: '', gitString: '' };

    return {
        ready: handler.ready(),
        gitSettings,
    };
})(GitSettings);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(GitSettingsContainer);
