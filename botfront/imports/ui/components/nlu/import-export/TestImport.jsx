import React from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import Alert from 'react-s-alert';
import { Meteor } from 'meteor/meteor';

export class TestImport extends React.Component {
    constructor(props) {
        super(props);

        this.loadFiles = this.loadFiles.bind(this);
    }

    loadFiles(files) {
        if (files.length > 1) {
            throw new Meteor.Error('You can only upload one file.');
        }


        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const data = JSON.parse(reader.result);
                    this.props.loadData(data);
                } catch (e) {
                    Alert.error('Error: you must upload a JSON file with the same format as an export', {
                        position: 'top',
                        timeout: 'none',
                    });
                }
            };

            reader.onabort = () => console.log('file reading was aborted');
            reader.onerror = () => console.log('file reading has failed');

            reader.readAsText(file, 'utf-8');
        });
    }

    render() {
        return (
            <div>
                {!this.props.isLoaded && (
                    <Dropzone
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
                    >
                        <p> Click or drag and drop a file here to upload test data. The file must me in Rasa NLU JSON format</p>
                    </Dropzone>
                )}
            </div>
        );
    }
}


TestImport.propTypes = {
    isLoaded: PropTypes.bool.isRequired,
    loadData: PropTypes.func.isRequired,
};
