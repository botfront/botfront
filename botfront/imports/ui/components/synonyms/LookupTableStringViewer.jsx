import React from 'react';
import PropTypes from 'prop-types';

const LookupTableListViewer = (props) => {
    const { item, listAttribute } = props;

    return <p className='ellipsis' data-cy='lookup-table-row-value'>{item[listAttribute]}</p>;
};

export default LookupTableListViewer;

LookupTableListViewer.propTypes = {
    item: PropTypes.object.isRequired,
    listAttribute: PropTypes.string.isRequired,
};
