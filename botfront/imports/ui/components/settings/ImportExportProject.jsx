import React from 'react';
import PropTypes from 'prop-types';

import { Menu, Tab } from 'semantic-ui-react';

import { connect } from 'react-redux';

import ImportProject from './ImportProject.jsx';
import ExportProject from './ExportProject.jsx';
import { can } from '../../../lib/scopes';

class ImportExportProject extends React.Component {
    constructor (props) {
        super(props);
        const { projectId } = props;
        this.state = { activeMenuItem: can('projects:w', projectId) ? 'Import' : 'Export', loading: false };
    }

    renderMenuItem = (itemText, itemKey = itemText) => {
        const { activeMenuItem, loading } = this.state;
        return (
            <Menu.Item
                disabled={loading}
                key={itemKey}
                active={activeMenuItem === itemKey}
                onClick={() => { this.setState({ activeMenuItem: itemKey }); }}
            >
                {itemText}
            </Menu.Item>
        );
    };

    setLoading = (newLoadingState) => {
        this.setState({ loading: newLoadingState });
    }

    getMenuPanes = () => {
        const { loading } = this.state;
        const { projectId } = this.props;
        const panes = [];
        if (can('projects:w', projectId)) {
            panes.push({
                menuItem: this.renderMenuItem('Import'),
                render: () => (
                    <Tab.Pane loading={loading} key='Import' data-cy='import-project-tab'>
                        <ImportProject setLoading={this.setLoading} />
                    </Tab.Pane>
                ),
            });
        }
        panes.push({
            menuItem: this.renderMenuItem('Export'),
            render: () => (
                <Tab.Pane loading={loading} key='Export' data-cy='export-project-tab'>
                    <ExportProject setLoading={this.setLoading} />
                </Tab.Pane>
            ),
        });
        return panes;
    }

    render () {
        return (
            <Tab className='import-export-project' menu={{ pointing: true, secondary: true, 'data-cy': 'port-project-menu' }} panes={this.getMenuPanes()} />
        );
    }
}

ImportExportProject.propTypes = {
    projectId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(ImportExportProject);
