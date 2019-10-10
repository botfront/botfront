import React from 'react';
import PropTypes from 'prop-types';
import { Divider, Header } from 'semantic-ui-react';
import DataExport from './DataExport';
import DataImport from './DataImport';

export default class ImportExport extends React.Component {

    render() {
        return (
            <div>
                <Header content="Export Data"/>
                <DataExport intents={this.props.intents} model={this.props.model}/>
                <Divider/>
                <Header content="Import Data"/>
                <DataImport model={this.props.model}/>
            </div>
        )
    }
}

ImportExport.propTypes = {
    model: PropTypes.string.isRequired,
    intents: PropTypes.array.isRequired
};