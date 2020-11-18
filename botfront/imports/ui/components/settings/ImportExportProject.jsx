import React from 'react';

import { Menu, Tab } from 'semantic-ui-react';

import ImportRasaFiles from './ImportRasaFiles.jsx';
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
        return [
            {
                menuItem: this.renderMenuItem('Import'),
                render: () => (
                    <Tab.Pane loading={loading} key='Import' data-cy='import-project-tab'>
                        <ImportRasaFiles />
                    </Tab.Pane>
                ),
            },
            {
                menuItem: this.renderMenuItem('Export'),
                render: () => (
                    <Tab.Pane loading={loading} key='Export' data-cy='export-project-tab'>
                        <ExportProject setLoading={this.setLoading} />
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
};

export default ImportExportProject;
