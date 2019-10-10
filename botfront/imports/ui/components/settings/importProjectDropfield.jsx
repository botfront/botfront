import React from 'react';
import PropTypes from 'prop-types';

import UploadDropzone from '../utils/UploadDropzone';

const ImportProjectDropfield = ({
    text,
    onChange,
    manipulateData,
    success,
    maxSizeInMb,
    verifyData,
    fileTag,
    successMessage,
}) => {
    const handleOnDropped = (data) => {
        const parsedData = manipulateData(data);
        if (verifyData(parsedData)) onChange({ [fileTag]: parsedData });
    };

    return (
        <UploadDropzone
            onDropped={handleOnDropped}
            text={text}
            binary={false}
            success={success}
            accept='.json'
            maxSizeInMb={maxSizeInMb}
            successMessage={successMessage}
            className='file-dropzone'
        />
    );
};

ImportProjectDropfield.propTypes = {
    onChange: PropTypes.func.isRequired,
    text: PropTypes.string,
    manipulateData: PropTypes.func,
    success: PropTypes.bool.isRequired,
    maxSizeInMb: PropTypes.number,
    verifyData: PropTypes.func,
    fileTag: PropTypes.string.isRequired,
    successMessage: PropTypes.string,
};

ImportProjectDropfield.defaultProps = {
    text: undefined,
    manipulateData: data => data,
    maxSizeInMb: 30,
    verifyData: () => true,
    successMessage: 'Your file is ready',
};

export default ImportProjectDropfield;
