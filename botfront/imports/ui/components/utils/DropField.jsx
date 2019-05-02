import React from 'react';
import PropTypes from 'prop-types';
import connectField from 'uniforms/connectField';

import UploadDropzone from './UploadDropzone';

class DropField extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            success: false,
        };

        this.handleJSON = this.handleJSON.bind(this);
    }

    handleJSON(data) {
        const { onChange, manipulateData } = this.props;

        this.setState({ success: true });

        const processData = manipulateData ? d => manipulateData(JSON.parse(d)) : d => JSON.parse(d);
        onChange(processData(data));
    }

    render() {
        const { text, title } = this.props;
        const { success } = this.state;

        return (
            <div className='required field'>
                <label>{title}</label>
                <UploadDropzone
                    onDropped={this.handleJSON}
                    text={text}
                    successOnLoad
                    binary={false}
                    success={success}
                />
            </div>
        );
    }
}

DropField.propTypes = {
    onChange: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    text: PropTypes.string,
    manipulateData: PropTypes.func,
};

DropField.defaultProps = {
    text: undefined,
    manipulateData: null,
};

export default connectField(DropField);
