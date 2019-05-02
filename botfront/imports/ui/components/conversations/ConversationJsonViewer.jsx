import React from 'react';
import PropTypes from 'prop-types';
import ReactJson from 'react-json-view';

const ConversationJsonViewer = ({ tracker }) => (
    <ReactJson src={tracker} collapsed={3} name={false} />
);

ConversationJsonViewer.propTypes = {
    tracker: PropTypes.object.isRequired,
};

export default ConversationJsonViewer;
