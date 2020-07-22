import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { getScopesForUser, areScopeReady } from '../../lib/scopes';
import { Projects } from '../../api/project/project.collection';

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
                    const projectIds = getScopesForUser(Meteor.userId(), 'owner') || Projects.find().fetch().map(project => project._id);
                    if (projectIds.length === 0) router.push('/404');
                    const projects = Projects.find({ _id: { $in: projectIds } }, { fields: { name: 1 } }).fetch();
                    const projectsWithoutChitchat = projects.filter(({ name }) => !name.match('chitchat'));
                    if (projectsWithoutChitchat.length === 0) router.push('/404');
                    router.push(`/project/${projectsWithoutChitchat[0]._id}/dialogs`);
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
