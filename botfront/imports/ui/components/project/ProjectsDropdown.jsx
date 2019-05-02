import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Dropdown } from 'semantic-ui-react';
import React from 'react';
import { Projects } from '../../../api/project/project.collection';

class ProjectsDropdown extends React.Component {
    getOptions = () => {
        const { projects } = this.props;

        return projects.map(({ _id, name }) => ({ text: name, value: _id }));
    };

    handleChange = (e, { value }) => this.props.onProjectChange(value);

    render() {
        const { currentProjectId, loading } = this.props;

        return (
            <div>
                <Dropdown
                    button
                    loading={loading}
                    fluid
                    selection
                    value={currentProjectId}
                    name='project'
                    options={this.getOptions()}
                    onChange={this.handleChange}
                />
            </div>
        );
    }
}

ProjectsDropdown.propTypes = {
    projects: PropTypes.arrayOf(PropTypes.object).isRequired,
    currentProjectId: PropTypes.string.isRequired,
    onProjectChange: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
};

const ProjectsDropdownContainer = withTracker(() => {
    const projectsHandle = Meteor.subscribe('projects.names');
    const loading = !projectsHandle.ready();
    const projects = Projects.find({ disabled: { $ne: true } }).fetch() || [];
    return {
        loading,
        projects,
    };
})(ProjectsDropdown);

export default ProjectsDropdownContainer;
