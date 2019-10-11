import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { getScopesForUser, areScopeReady } from '../../lib/scopes';
import { can } from '../../api/roles/roles';

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
        if (can('stories:r', pId)) {
            return `/project/${pId}/stories`;
        }
        if (can('nlu-data:r', pId)) {
            return `/project/${pId}/nlu/models`;
        }
        if (can('responses:r', pId)) {
            return `/project/${pId}/dialogue/templates`;
        }
        if (can('conversations:r', pId)) {
            return `/project/${pId}/dialogue/conversations/env/development/p/1`;
        }
        if (can('project-settings:r', pId)) {
            return `/project/${pId}/settings`;
        }
        return ('/404');
    };

    route = () => {
        const { router, projectsReady } = this.props;
        if (Meteor.userId()) {
            Tracker.autorun(() => {
                if (Meteor.user() && areScopeReady() && projectsReady) {
                    if (can('global-admin', undefined, Meteor.userId())) router.push('/admin/projects');
                    else {
                        const projects = getScopesForUser(Meteor.userId(), '');
                        if (projects.length === 0) {
                            router.push('/404');
                        } else {
                            router.push(this.roleRouting(projects[0]));
                        }
                    }
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
