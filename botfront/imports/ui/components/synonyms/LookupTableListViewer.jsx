import React from 'react';
import PropTypes from 'prop-types';

const LookupTableListViewer = ({ entitySynonym, listAttribute }) => {
    const renderText = () => entitySynonym[listAttribute].join(', ');

    return <p className='ellipsis' data-cy='lookup-table-row-value'>{renderText()}</p>;
};

export default LookupTableListViewer;

LookupTableListViewer.propTypes = {
    entitySynonym: PropTypes.object.isRequired,
    listAttribute: PropTypes.string.isRequired,
};
