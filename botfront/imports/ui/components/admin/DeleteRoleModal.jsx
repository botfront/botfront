import {
    Modal, Button, Dropdown, Message,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

const DeleteRoleModal = (props) => {
    const {
        roleName, onConfirm, onCancel, roles,
    } = props;
    const [fallback, setFallback] = useState(null);
    const [error, setError] = useState(null);
    const handleSubmit = () => {
        if (!fallback) {
            setError('Please specify a fallback role.');
        } else {
            onConfirm(fallback);
        }
    };
    return (
        <Modal open>
            <Modal.Header>{`Delete ${roleName}`}</Modal.Header>
            <Modal.Content data-cy='delete-role-modal'>
                There might be users with that role, what role do you want them to fallback to ?
                <br />
                <br />
                <Dropdown
                    value={fallback}
                    onChange={(_, data) => {
                        setFallback(data.value);
                    }}
                    options={roles}
                    selection
                    placeholder='Select a fallback role'
                    fluid
                    data-cy='select-fallback-role'
                />
                <br />
                {error && (
                    <Message negative>
                        {error}
                    </Message>
                )}
                <br />
                <Button onClick={onCancel}>Cancel</Button>
                <Button onClick={handleSubmit} negative>Delete</Button>
            </Modal.Content>
        </Modal>
    );
};

DeleteRoleModal.propTypes = {
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    roleName: PropTypes.string.isRequired,
    roles: PropTypes.array.isRequired,
};

export default DeleteRoleModal;
