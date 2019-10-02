import React from 'react';
import Dropzone from 'react-dropzone';
import { Message } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { Loading } from './Utils';

export default class UploadDropzone extends React.Component {
    constructor(props) {
        super(props);
        this.state = { processing: false };
    }

    onError = (text) => {
        const { onError } = this.props;
        this.setState({ processing: false });
        return onError(text);
    };

    loadFiles = (acceptedFiles, rejectedFiles) => {
        const {
            onDropped, maxSizeInMb, accept, binary,
        } = this.props;

        this.setState({ processing: true });

        if (!acceptedFiles.length && !rejectedFiles.length) return this.onError('Sorry, could not read you file');
        if (rejectedFiles.length) return this.onError(`${rejectedFiles[0].name} is not of type: ${accept}`);
        if (acceptedFiles.length > 1) return this.onError('Please upload only one file');
        if (acceptedFiles[0].size > maxSizeInMb * 1000000) return this.onError(`Your file should not exceed ${maxSizeInMb}Mb.`);

        const file = acceptedFiles[0];

        const reader = new FileReader();
        reader.onload = () => {
            this.setState({ processing: false });
            try {
                onDropped(reader.result, file);
            } catch (e) {
                throw e;
            }
        };

        reader.onabort = () => this.onError('file reading was aborted');
        reader.onerror = () => this.onError('file reading has failed');
        return binary ? reader.readAsBinaryString(file) : reader.readAsText(file);
    };

    isLoading = () => {
        const { loading } = this.props;
        const { processing } = this.state;
        return loading || processing;
    };

    render() {
        const {
            success, text, successMessage, accept, className,
        } = this.props;

        return (
            <Loading loading={this.isLoading()}>
                {!success ? (
                    <Dropzone
                        className={className}
                        style={{
                            padding: '10px',
                            width: '100%',
                            height: '120px',
                            borderWidth: '2px',
                            borderColor: 'black',
                            borderStyle: 'dashed',
                            borderRadius: '5px',
                        }}
                        multiple={false}
                        onDrop={this.loadFiles}
                        accept={accept}
                    >
                        {text}
                    </Dropzone>
                ) : (
                    <Message
                        positive
                        header='Success!'
                        icon='check circle'
                        content={successMessage}
                    />
                )}
            </Loading>
        );
    }
}

UploadDropzone.propTypes = {
    onDropped: PropTypes.func.isRequired,
    accept: PropTypes.string.isRequired,
    onError: PropTypes.func,
    text: PropTypes.string,
    successMessage: PropTypes.string,
    success: PropTypes.bool,
    loading: PropTypes.bool,
    binary: PropTypes.bool,
    maxSizeInMb: PropTypes.number,
    className: PropTypes.string,
};

UploadDropzone.defaultProps = {
    text: 'Drop your file here',
    successMessage: 'Your file is ready',
    success: false,
    loading: false,
    binary: true,
    onError: console.log,
    maxSizeInMb: 2,
    className: '',
};
