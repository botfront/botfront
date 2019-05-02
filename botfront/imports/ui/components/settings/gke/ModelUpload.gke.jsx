import { Segment } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import 'react-s-alert/dist/s-alert-default.css';
import { Meteor } from 'meteor/meteor';
import Alert from 'react-s-alert';
import UploadDropzone from '../../utils/UploadDropzone';
import { wrapMeteorCallback } from '../../utils/Errors';

class ModelUpload extends React.Component {
    constructor(props) {
        super(props);
        this.state = { success: false, loading: false };
    }

    onSave = (fileData) => {
        const { projectId } = this.props;
        this.setState({ loading: true });
        Meteor.call(
            'upload.modelToGCS',
            fileData,
            projectId,
            wrapMeteorCallback((err) => {
                this.setState({ loading: false });
                if (err) console.log(err);
                else this.setState({ success: true });
            }),
        );
    };

    onError = error => Alert.error(`${error}`, { position: 'top' });

    render() {
        const { success, loading } = this.state;
        return (
            <UploadDropzone
                success={success}
                loading={loading}
                accept='application/zip, application/octet-stream, application/x-zip-compressed, multipart/x-zip'
                maxSizeInMb={10}
                text='Drop a zip file containing your trained policy'
                successMessage='Your policy is ready'
                onDropped={this.onSave}
                onError={this.onError}
            />
        );
    }
}

ModelUpload.propTypes = {
    projectId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
    projectId: state.get('projectId'),
});

export default connect(mapStateToProps)(ModelUpload);
