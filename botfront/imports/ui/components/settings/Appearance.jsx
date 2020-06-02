import { AutoForm, ErrorsField, AutoField } from 'uniforms-semantic';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import { logosSchema } from '../../../api/project/project.schema.default';
import { Projects } from '../../../api/project/project.collection';
import { wrapMeteorCallback } from '../utils/Errors';
import ChangesSaved from '../utils/ChangesSaved';
import SaveButton from '../utils/SaveButton';
import { can } from '../../../lib/scopes';

class Appearance extends React.Component {
    constructor(props) {
        super(props);
        this.state = { saving: false, saved: false, showConfirmation: false };
    }

    componentWillUnmount() {
        clearTimeout(this.successTimeout);
    }

    onSave = (logos) => {
        const { projectId } = this.props;
        this.setState({ saving: true, showConfirmation: false });
        clearTimeout(this.successTimeout);
        Meteor.call(
            'project.update',
            { _id: projectId, smallLogoUrl: logos.smallLogoUrl, logoUrl: logos.logoUrl },
            wrapMeteorCallback((err) => {
                if (!err) {
                    this.setState({ saved: true, showConfirmation: true });
                    this.successTimeout = setTimeout(() => {
                        this.setState({ saved: false });
                    }, 2 * 1000);
                }
                this.setState({ saving: false });
            }),
        );
    };

    renderAppearance = () => {
        const { logoUrl, smallLogoUrl, projectId } = this.props;
        const { saved, showConfirmation, saving } = this.state;
        const hasWritePermission = can('projects:w', projectId);
        return (
            <>
                <AutoForm
                    disabled={saving || !hasWritePermission}
                    schema={logosSchema}
                    model={{ logoUrl, smallLogoUrl }}
                    onSubmit={this.onSave}
                >
                    <AutoField name='logoUrl' label='Logo URL (The logo displayed at the top of the expanded sidebar)' />
                    <AutoField name='smallLogoUrl' label='Small logo URL (the logo displayed at the top of the collapsed sidebar)' />
                    <ErrorsField />
                    {showConfirmation && (
                        <ChangesSaved
                            onDismiss={() => this.setState({ saved: false, showConfirmation: false })}
                        />
                    )}
                    {hasWritePermission && <SaveButton saved={saved} saving={saving} />}
                </AutoForm>
            </>
        );
    };

    renderLoading = () => <div />;

    render() {
        const { ready } = this.props;
        if (ready) return this.renderAppearance();
        return this.renderLoading();
    }
}

Appearance.propTypes = {
    projectId: PropTypes.string.isRequired,
    ready: PropTypes.bool.isRequired,
    logoUrl: PropTypes.string,
    smallLogoUrl: PropTypes.string,
};

Appearance.defaultProps = {
    logoUrl: '',
    smallLogoUrl: '',
};

const DefaultDomainContainer = withTracker(({ projectId }) => {
    const handler = Meteor.subscribe('projects', projectId);
    const { logoUrl, smallLogoUrl } = Projects.findOne({ _id: projectId }) || { content: '' };

    return {
        ready: handler.ready(),
        logoUrl,
        smallLogoUrl,
    };
})(Appearance);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(DefaultDomainContainer);
