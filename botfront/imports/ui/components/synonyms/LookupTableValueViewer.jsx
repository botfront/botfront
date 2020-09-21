import React from 'react';
import PropTypes from 'prop-types';

const LookupTableValueViewer = ({ value }) => (
    <p data-cy='lookup-table-row-key'>{value}</p>
);

export default LookupTableValueViewer;

LookupTableValueViewer.propTypes = {
    value: PropTypes.string.isRequired,
};
