import React from 'react';
import PropTypes from 'prop-types'

const LookupTableValueViewer = ({value}) => {

    return (
        <p>{value}</p>
    );
};

export default LookupTableValueViewer;

LookupTableValueViewer.propTypes = {
    value: PropTypes.string.isRequired
};