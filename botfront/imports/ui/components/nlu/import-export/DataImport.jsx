import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import {
    Button, Checkbox, Icon, Message, Tab,
} from 'semantic-ui-react';
import AceEditor from 'react-ace';
import 'brace/mode/json';
import 'brace/theme/github';
import 'brace/ext/language_tools';
import Dropzone from 'react-dropzone';
import Alert from 'react-s-alert';
import { saveAs } from 'file-saver';
import moment from 'moment';
import { getTrainingDataInRasaFormat } from '../../../../api/instances/instances.methods';
import { wrapMeteorCallback } from '../../utils/Errors';

export default class DataImport extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getInitialState();
    }

    getInitialState() {
        return {
            values: '',
            fileErrors: [],
            jsonValid: false,
            uploading: false,
            overwrite: false,
            backupDownloaded: false,
        };
    }

    errorAlert = (errorMessage) => {
        Alert.error(`${errorMessage}`, {
            position: 'top',
            timeout: 5 * 1000,
        });
    }

    onDrop = (files) => {
        const { model, instanceHost } = this.props;
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (file.name.split('.').pop() === 'json') {
                    try {
                        // Check if the content of file is valid JSON
                        JSON.parse(reader.result);
                        this.setState({ values: reader.result });
                    } catch (e) {
                        // If the content is not JSON it shows error
                        this.errorAlert('Error: invalid schema');
                        this.setState({ values: null });
                    }
                } else {
                    Meteor.call('rasa.convertToJson', reader.result, model.language, 'json', instanceHost, (err, result) => {
                        if (err) {
                            this.errorAlert('Error: invalid schema');
                        } else {
                            Alert.success('Data successfully converted to JSON', {
                                position: 'top-right',
                                timeout: 1 * 1000,
                            });
                            this.setState({ values: JSON.stringify(result.data, null, '\t') }); // Additional arguments for pretty-print appearance
                        }
                    });
                }
            };
            reader.onabort = () => console.log('file reading was aborted');
            reader.onerror = () => console.log('file reading has failed');
            reader.readAsText(file, 'utf-8');
        });
    };

    handleDropReject = () => {
        this.errorAlert('Error: file not supported, make sure file size is less than 5 Mb.');
    }

    downloadModelData = () => {
        const { model } = this.props;
        const data = JSON.stringify(getTrainingDataInRasaFormat(model, true, [], false), null, 2);
        const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
        const filename = `${model.name.toLowerCase()}-${moment().toISOString()}.json`;
        saveAs(blob, filename);
        this.setState({ backupDownloaded: true });
    };

    uploadData = () => {
        try {
            this.setState({ uploading: true });
            const { values } = this.state;
            const importObject = JSON.parse(values);

            if (importObject && importObject.rasa_nlu_data) {
                const { model } = this.props;
                const { overwrite } = this.state;
                // TODO handle .rasa_nlu_data in nlu.import directly
                Meteor.call('nlu.import', importObject.rasa_nlu_data, model._id, overwrite, wrapMeteorCallback((err) => {
                    if (!err) this.setState(this.getInitialState);
                    this.setState({ uploading: false });
                }, 'Data successfully imported'));
            } else {
                this.setState({ uploading: false });
                this.errorAlert('Error: invalid schema');
            }
        } catch (e) {
            this.setState({ uploading: false });
            this.errorAlert(`Error: ${e.reason}`);
        }
    };

    onChange = (value) => {
        this.setState({ values: value });
    };

    toggleOverwrite = () => {
        const { overwrite } = this.state;
        this.setState({ overwrite: !overwrite });
    };

    render() {
        const {
            values, overwrite, backupDownloaded, fileErrors, uploading,
        } = this.state;
        return (
            <Tab.Pane>
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
                    maxSize={5000000}
                    multiple={false}
                    onDrop={this.onDrop}
                    className='file-dropzone'
                    onDropRejected={this.handleDropReject}
                >
                    <p> Drop Rasa NLU training data in json format. Data should not be larger than <strong>5 Mb</strong>.</p>
                </Dropzone>
                <br />
                <br />
                {values && (
                    <AceEditor
                        width='100%'
                        mode='json'
                        theme='github'
                        name='nlu_data'
                        fontSize={14}
                        showPrintMargin={false}
                        showGutter
                        onChange={this.onChange}
                        value={values}
                        editorsProps={{ $blockScrolling: true }}
                        setOptions={{
                            enableBasicAutocompletion: true,
                            enableLiveAutocompletion: false,
                            enableSnippets: false,
                            showLineNumbers: false,
                            tabSize: 2,
                        }}
                    />
                )}
                <br />
                <Checkbox
                    label='Overwrite existing data'
                    disabled={values === ''}
                    checked={overwrite}
                    slider
                    onChange={this.toggleOverwrite}
                />
                <br />
                <br />
                {overwrite && !backupDownloaded
                && (
                    <div>
                        <Message
                            warning
                            header='Your training data will be overwritten!'
                            icon='warning circle'
                            content='Please use the button below to download a backup before proceeding.'
                        />
                        <br />
                        <Button onClick={this.downloadModelData}>
                            <Icon name='download' />
                            Backup Model Data
                        </Button>
                    </div>
                )}
                {backupDownloaded && <Message success icon='check' content='Backup downloaded' />}
                <br />
                <br />
                <Button
                    type='submit'
                    loading={uploading}
                    onClick={this.uploadData}
                    disabled={fileErrors.length > 0 || values === '' || overwrite && !backupDownloaded}
                >
                    <Icon name='upload' />
                    Import Training Data
                </Button>
            </Tab.Pane>
        );
    }
}

DataImport.propTypes = {
    model: PropTypes.object.isRequired,
    instanceHost: PropTypes.string.isRequired,
};
