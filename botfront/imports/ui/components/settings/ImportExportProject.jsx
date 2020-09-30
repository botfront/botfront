import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';

import { Menu, Tab } from 'semantic-ui-react';

import { connect } from 'react-redux';
import { GlobalSettings } from '../../../api/globalSettings/globalSettings.collection';

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
        const { apiHost, projectId } = this.props;
        const panes = [];
        if (can('projects:w', projectId)) {
            panes.push({
                menuItem: this.renderMenuItem('Import'),
                render: () => (
                    <Tab.Pane loading={loading} key='Import' data-cy='import-project-tab'>
                        <ImportProject setLoading={this.setLoading} apiHost={apiHost} />
                    </Tab.Pane>
                ),
            });
        }
        panes.push({
            menuItem: this.renderMenuItem('Export'),
            render: () => (
                <Tab.Pane loading={loading} key='Export' data-cy='export-project-tab'>
                    <ExportProject setLoading={this.setLoading} apiHost={apiHost} />
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
    apiHost: PropTypes.string,
    projectId: PropTypes.string.isRequired,
};

ImportExportProject.defaultProps = {
    apiHost: '',
};

const ImportExportProjectTracker = withTracker(() => {
    const settingsHandler = Meteor.subscribe('settings');
    const settings = GlobalSettings
        .findOne({ _id: 'SETTINGS' }, { fields: { 'settings.private.bfApiHost': true } });
    let api = 'dummy';
    if (settings && settings.settings && settings.settings.private && settings.settings.private.bfApiHost) {
        api = settings.settings.private.bfApiHost;
    }
    return {
        ready: settingsHandler.ready(),
        apiHost: api,
    };
})(ImportExportProject);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(ImportExportProjectTracker);
