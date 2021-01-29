
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

class GitSettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = { saving: false, saved: false };
    }

    componentWillUnmount() {
        clearTimeout(this.successTimeout);
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
                    }, 2 * 1000);
                }
                this.setState({ saving: false });
            }),
        );
    };

    renderGitSettings = () => {
        const { gitSettings, projectId } = this.props;
        const { saving, saved } = this.state;
        const bridge = new SimpleSchema2Bridge(GitSettingsSchema);
        const hasWritePermission = can('projects:w', projectId);
        return (
            <AutoForm
                schema={bridge}
                model={gitSettings}
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
                <ErrorsField />
              
                {hasWritePermission && <SaveButton saved={saved} saving={saving} />}

                
            </AutoForm>
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
