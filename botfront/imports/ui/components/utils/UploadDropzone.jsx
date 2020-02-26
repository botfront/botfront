import React, { useState, useRef } from 'react';
import { NativeTypes } from 'react-dnd-html5-backend-cjs';
import { useDrop } from 'react-dnd-cjs';
import {
    Message, Icon, Button, Segment,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { Loading } from './Utils';

export default function UploadDropzone(props) {
    const {
        onDropped, accept: acceptString = '', onError, successMessage, success, loading, binary, maxSizeInMb,
    } = props;
    const [processing, setProcessing] = useState(false);
    const fileField = useRef();

    const handleError = (string) => {
        setProcessing(false);
        return onError(string);
    };

    const loadFiles = (files) => {
        setProcessing(true);

        const accept = acceptString.split(/,\s*/);
        let acceptedFiles = files.filter(f => accept.includes(f.type) || accept.some(t => f.name.match(new RegExp(`${t}$`))));
        let rejectedFiles = files.filter(f => !acceptedFiles.includes(f));
        if (!acceptString) {
            acceptedFiles = files;
            rejectedFiles = [];
        }

        if (!acceptedFiles.length && !rejectedFiles.length) return handleError('Sorry, could not read you file');
        if (rejectedFiles.length) return handleError(`${rejectedFiles[0].name} is not of type: ${accept}`);
        if (acceptedFiles.length > 1) return handleError('Please upload only one file');
        if (acceptedFiles[0].size > maxSizeInMb * 1000000) return handleError(`Your file should not exceed ${maxSizeInMb}Mb.`);

        const file = acceptedFiles[0];

        const reader = new FileReader();
        reader.onload = () => {
            setProcessing(false);
            try {
                onDropped(reader.result, file);
            } catch (e) {
                throw e;
            }
        };

        reader.onabort = () => handleError('file reading was aborted');
        reader.onerror = () => handleError('file reading has failed');
        return binary ? reader.readAsBinaryString(file) : reader.readAsText(file);
    };

    const [{ canDrop, isOver }, drop] = useDrop({
        accept: [NativeTypes.FILE],
        drop: item => loadFiles(Array.from(item.files)),
        collect: monitor => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    return (
        <Loading loading={loading || processing}>
            {!success ? (
                <Segment className={`import-box ${canDrop && isOver ? 'upload-target' : ''}`}>
                    <div ref={drop} className='align-center' data-cy='upload-dropzone'>
                        <Icon name='file' size='huge' color='grey' style={{ marginBottom: '8px' }} />
                        <input
                            type='file'
                            ref={fileField}
                            style={{ display: 'none' }}
                            onChange={e => loadFiles(Array.from(e.target.files))}
                        />
                        <Button
                            primary
                            basic
                            content='Upload file'
                            size='small'
                            onClick={() => fileField.current.click()}
                        />
                        <span className='small grey'>or drop a file to upload</span>
                    </div>
                </Segment>
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

UploadDropzone.propTypes = {
    onDropped: PropTypes.func.isRequired,
    accept: PropTypes.string.isRequired,
    onError: PropTypes.func,
    successMessage: PropTypes.string,
    success: PropTypes.bool,
    loading: PropTypes.bool,
    binary: PropTypes.bool,
    maxSizeInMb: PropTypes.number,
};

UploadDropzone.defaultProps = {
    successMessage: 'Your file is ready',
    success: false,
    loading: false,
    binary: true,
    onError: console.log,
    maxSizeInMb: 2,
};
