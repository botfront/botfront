import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';
import AceEditor from 'react-ace';
import 'brace/ext/language_tools';
import 'brace/mode/json';
import 'brace/theme/github';
import Dropzone from 'react-dropzone';
import Alert from 'react-s-alert';
import { useMutation } from '@apollo/react-hooks';
import { ADD_BOT_RESPONSES } from './mutations';

export default function DataImport(props) {
    const { projectId } = props;
    const [values, setValues] = useState('');
    const [uploading, setUploading] = useState(false);
    const [addResponses] = useMutation(ADD_BOT_RESPONSES, {
        onCompleted: () => {
            setUploading(false);
            setValues('');
            Alert.success('Data imported successfully!', {
                position: 'bottom',
                timeout: 1000,
            });
        },
        onError: (error) => {
            setUploading(false);
            Alert.error(`Error: ${error.message}`, {
                position: 'bottom',
                timeout: 'none',
            });
        },
    });

    function uploadData() {
        try {
            setUploading(true);

            if (values) {
                addResponses({
                    variables: { projectId, responses: values },
                });
            } else {
                setUploading(false);
                Alert.error('Error: invalid schema', {
                    position: 'bottom',
                    timeout: 'none',
                });
            }
        } catch (e) {
            setUploading(false);
            Alert.error(`Error: ${e.reason}`, {
                position: 'bottom',
                timeout: 'none',
            });
            console.log(e);
        }
    }

    function onDrop(files) {
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                setValues(reader.result);
            };
            reader.onabort = () => console.log('file reading was aborted');
            reader.onerror = () => console.log('file reading has failed');

            reader.readAsText(file, 'utf-8');
        });
    }


    const onChange = (newValues) => {
        setValues(newValues);
    };


    return (
        <div>
            <br /><br />
            <Dropzone
                multiple={false}
                onDrop={onDrop}
            >
                <p> Drop templates in json format </p>
            </Dropzone>
            <br /><br />
            {values && (
                <AceEditor
                    width='100%'
                    mode='json'
                    theme='github'
                    name='templates'
                    fontSize={14}
                    showPrintMargin={false}
                    showGutter
                    onChange={onChange}
                    editorsProps={{ $blockScrolling: true }}
                    value={values}

                    setOptions={{
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: false,
                        enableSnippets: false,
                        showLineNumbers: false,
                        tabSize: 2,
                    }}
                />
            )}
            <br /><br />
            <Button
                type='submit'
                loading={uploading}
                onClick={() => uploadData()}
                disabled={values === ''}
            >Upload Templates
            </Button>
        </div>
    );
}

DataImport.propTypes = {
    projectId: PropTypes.string.isRequired,
};
