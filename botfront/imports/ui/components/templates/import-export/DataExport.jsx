import { Button } from 'semantic-ui-react';
import { Meteor } from 'meteor/meteor';
import { connect } from 'react-redux';
import { saveAs } from 'file-saver';
import PropTypes from 'prop-types';
import moment from 'moment';
import React from 'react';

class DataExport extends React.Component {

    downloadData = () => {
        const { projectId } = this.props;
        Meteor.call('templates.download', projectId, (err, result) => {
            const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'text/plain;charset=utf-8' });
            const filename = `responses_${projectId}-${moment().toISOString()}.json`;
            saveAs(blob, filename);
        });
    };

    render() {
        return (
            <div>
                <br />
                <br />
                <Button type='submit' onClick={this.downloadData} content='Export bot responses' />
            </div>
        );
    }
}

DataExport.propTypes = {
    projectId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});


export default connect(
    mapStateToProps,
)(DataExport);
