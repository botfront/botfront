import { Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { saveAs } from 'file-saver';
import PropTypes from 'prop-types';
import moment from 'moment';
import React from 'react';
import { useLazyQuery } from '@apollo/react-hooks';
import { GET_BOT_RESPONSES } from '../queries';

function DataExport({ projectId }) {
    const [getBotResonses] = useLazyQuery(GET_BOT_RESPONSES, {
        onCompleted: (data) => {
            const blob = new Blob([JSON.stringify(data.botResponses, null, 2)], { type: 'text/plain;charset=utf-8' });
            const filename = `responses_${projectId}-${moment().toISOString()}.json`;
            saveAs(blob, filename);
        },
    });

    const downloadData = () => {
        getBotResonses({ variables: { projectId } });
    };

    return (
        <div>
            <br />
            <br />
            <Button type='submit' onClick={downloadData} content='Export bot responses' />
        </div>
    );
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
