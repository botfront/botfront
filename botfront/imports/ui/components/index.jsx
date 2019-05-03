import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { can, getScopesForUser, areScopeReady } from '../../lib/scopes';

class Index extends React.Component {
    componentDidMount() {
        this.route();
    }

    componentDidUpdate(prevProps) {
        const { projectsReady } = this.props;
        if (projectsReady !== prevProps.projectsReady) {
            this.route();
        }
    }

    route = () => {
        const { router, projectsReady } = this.props;
        if (Meteor.userId()) {
            Tracker.autorun(() => {
                if (Meteor.user() && areScopeReady() && projectsReady) {
                    if (can('global-admin', Meteor.userId())) router.push('/admin/projects');
                    else {
                        const projects = getScopesForUser(Meteor.userId(), 'owner');
                        if (projects.length === 0) {
                            router.push('/404');
                        } else {
                            router.push(`/project/${projects[0]}/nlu/models`);
                        }
                    }
                }
            });
        } else {
            router.push('/login/');
        }
    }

    render() {
        return (
            <div />
        );
    }
}

Index.propTypes = {
    router: PropTypes.object.isRequired,
    projectsReady: PropTypes.bool.isRequired,
};

export default withTracker(() => {
    const projectsHandler = Meteor.subscribe('projects.names');

    return {
        projectsReady: projectsHandler.ready(),
    };
})(Index);
