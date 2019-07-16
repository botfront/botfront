import React from 'react';
import PropTypes from 'prop-types';
import connectField from 'uniforms/connectField';
import { Meteor } from 'meteor/meteor';
import { Image, Icon } from 'semantic-ui-react';

import UploadDropzone from './UploadDropzone';
import { wrapMeteorCallback } from './Errors.jsx';

class ImageField extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            file: null,
        };
    }

    componentDidMount() {
        const { getImageUpload } = this.props;
        getImageUpload(this.upload);
    }

    componentWillUnmount() {
        const { file } = this.state;
        if (file) {
            URL.revokeObjectURL(file.url);
        }
    }

    updateUrl = (url, local = false) => {
        const { value, onChange } = this.props;

        value.url = url;
        if (local) {
            value.imageId = 'local';
        }
        onChange(value);
    };

    upload = () => {
        const { projectId, value, value: { imageId } } = this.props;
        const { file } = this.state;

        if (file) {
            const { data, extension } = file;
            return new Promise((resolve) => {
                if (imageId === 'local') {
                    Meteor.call('images.addImage', data, projectId, extension, wrapMeteorCallback((error, result) => {
                        resolve(result);
                    }));
                } else {
                    Meteor.call('images.updateImage', data, projectId, imageId, extension, wrapMeteorCallback((error, result) => {
                        resolve(result);
                    }));
                }
            });
        }

        return value;
    };

    onDrop = (fileData, file) => {
        const { value: { imageId } } = this.props;
        const [_, extension] = file.name.match(/\.(\w+)$/);
        const url = URL.createObjectURL(file);
        if (!imageId) {
            this.updateUrl(url, true);
        } else {
            this.updateUrl(url);
        }

        this.setState({
            file: {
                data: fileData,
                extension,
                url,
            },
        });
    };

    removeImage = () => {
        const { file } = this.state;

        if (file) {
            URL.revokeObjectURL(file.url);
            this.setState({ file: null });
        }
        this.updateUrl(null);
    };

    render() {
        const { label, message, required, value: { url } } = this.props;

        return (
            <div className={`${required ? 'required ' : ''}field image-field`}>
                {!url ? ([
                    <label>{label}</label>,
                    <UploadDropzone
                        accept='image/jpeg, image/png, image/gif'
                        maxSizeInMb={1}
                        text={message}
                        onDropped={this.onDrop}
                    />,
                ]) : ([
                    <label>{label}</label>,
                    <Icon className='cancel-button' name='cancel' corner onClick={this.removeImage} />,
                    <Image className='image-preview' src={url} />,
                ])}
            </div>
        );
    }
}

ImageField.propTypes = {
    projectId: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    getImageUpload: PropTypes.func.isRequired,
    value: PropTypes.shape({
        url: PropTypes.string,
        imageId: PropTypes.string,
    }).isRequired,
    message: PropTypes.string,
    required: PropTypes.bool,
};

ImageField.defaultProps = {
    message: 'Drop an image you would like to upload',
    required: true,
};

export default connectField(ImageField);
