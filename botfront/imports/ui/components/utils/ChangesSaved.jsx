import { Message } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';

export default function ChangesSaved({
    title, content, onDismiss,
}) {
    return (
        <Message positive data-cy='changes-saved' onDismiss={onDismiss}>
            <Message.Header>{title}</Message.Header>
            {content}
        </Message>
    );
}

ChangesSaved.propTypes = {
    title: PropTypes.string,
    content: PropTypes.element,
    onDismiss: PropTypes.func,
};

ChangesSaved.defaultProps = {
    content: <></>,
    title: 'Your changes have been saved.',
    onDismiss: null,
};
