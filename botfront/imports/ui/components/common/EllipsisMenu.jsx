import React from 'react';
import {
    Dropdown,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';

function EllipsisMenu(props) {
    const { handleEdit, handleDelete } = props;
    return (
        <Dropdown
            id='ellipsis-icon'
            icon='ellipsis vertical'
            compact
        >
            <Dropdown.Menu id='ellipsis-menu'>
                <Dropdown.Item onClick={handleEdit}>Edit</Dropdown.Item>
                <Dropdown.Item onClick={handleDelete}>Delete</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
}

EllipsisMenu.propTypes = {
    handleEdit: PropTypes.func.isRequired,
    handleDelete: PropTypes.func.isRequired,
};


export default EllipsisMenu;
