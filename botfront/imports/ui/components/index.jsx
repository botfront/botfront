import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import {
    getUserScopes, areScopeReady, can,
} from '../../lib/scopes';


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

    roleRouting = (pId) => {
        if (can('projects:r')) {
            return '/admin/projects';
        }
        if (can('stories:r', pId)) {
            return `/project/${pId}/dialogue`;
        }
        if (can('users:r', { anyScope: true })) {
            return '/admin/users';
        }
        if (can('roles:r', { anyScope: true })) {
            return '/admin/roles';
        }
        if (can('global-settings:r', { anyScope: true })) {
            return '/admin/settings';
        }
        if (can('nlu-data:r', pId)) {
            return `/project/${pId}/nlu/models`;
        }
        if (can('responses:r', pId)) {
            return `/project/${pId}/responses`;
        }
        return ('/404');
    };

    route = () => {
        const { router, projectsReady } = this.props;
        if (Meteor.userId()) {
            Tracker.autorun(() => {
                if (Meteor.user() && areScopeReady() && projectsReady) {
                    const projects = getUserScopes(Meteor.userId());
                    router.push(this.roleRouting(projects[0]));
                }
            });
        } else {
            router.push('/login/');
        }
    };

    render() {
        return <div />;
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
