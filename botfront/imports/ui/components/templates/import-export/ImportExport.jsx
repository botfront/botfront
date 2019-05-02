import {Meteor} from "meteor/meteor";
import AceEditor from 'react-ace'
import React from "react";
import PropTypes from "prop-types"
import {Divider, Header} from "semantic-ui-react";
import 'brace/mode/json';
import 'brace/theme/github';
import DataExport from "./DataExport";
import DataImport from "./DataImport";
export default class ImportExport extends React.Component {


    render() {

        return (
            <div>
                <Header content="Export Data"/>
                <DataExport projectId={this.props.projectId}/>
                <Divider/>
                <Header content="Import Data"/>
                <DataImport projectId={this.props.projectId}/>
            </div>
        )
    }
}

ImportExport.propTypes = {
    projectId: PropTypes.string.isRequired,
}