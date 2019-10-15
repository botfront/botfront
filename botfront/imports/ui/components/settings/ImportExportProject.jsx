import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';

import { Menu, Tab } from 'semantic-ui-react';

import { GlobalSettings } from '../../../api/globalSettings/globalSettings.collection';

import ImportProject from './ImportProject.jsx';
import ExportProject from './ExportProject.jsx';


class ImportExportProject extends React.Component {
    constructor (props) {
        super(props);
        this.state = { activeMenuItem: 'Import', loading: false };
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
        const { apiHost } = this.props;
        return [
            {
                menuItem: this.renderMenuItem('Import'),
                render: () => (
                    <Tab.Pane loading={loading} key='Import' data-cy='import-project-tab'>
                        <ImportProject setLoading={this.setLoading} apiHost={apiHost} />
                    </Tab.Pane>
                ),
            },
            {
                menuItem: this.renderMenuItem('Export'),
                render: () => (
                    <Tab.Pane loading={loading} key='Export' data-cy='export-project-tab'>
                        <ExportProject setLoading={this.setLoading} apiHost={apiHost} />
                    </Tab.Pane>
                ),
            },
        ];
    }

    render () {
        return (
            <Tab className='import-export-project' menu={{ pointing: true, secondary: true, 'data-cy': 'port-project-menu' }} panes={this.getMenuPanes()} />
        );
    }
}

ImportExportProject.propTypes = {
    apiHost: PropTypes.string,
};

ImportExportProject.defaultProps = {
    apiHost: '',
};

export default withTracker(() => {
    const apiHost = GlobalSettings
        .findOne({ _id: 'SETTINGS' }, { fields: { 'settings.private.bfApiHost': true } })
        .settings.private.bfApiHost;
    return {
        apiHost,
    };
})(ImportExportProject);
