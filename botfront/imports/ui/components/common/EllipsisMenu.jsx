import React from 'react';
import {
    Dropdown, Popup,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';

function EllipsisMenu(props) {
    const {
        handleEdit, handleDelete, onClick, deletable,
    } = props;
    return (
        <Dropdown
            id='ellipsis-icon'
            icon='ellipsis vertical'
            compact
            direction='left'
            data-cy='ellipsis-menu'
            

            onClick={() => onClick()}
        >
            <Dropdown.Menu id='ellipsis-menu'>
                <Dropdown.Item data-cy='edit-menu' onClick={handleEdit}>Edit</Dropdown.Item>
                {/* the disabling of the delete menu is handled with css, disabling it with the props also disable the popup */}
                <Popup
                    content='There are stories linking to this group or stories from this group are linked to others stories'
                    disabled={deletable}
                    position='bottom left'
                    trigger={(
                        <Dropdown.Item
                            onClick={deletable ? handleDelete : null}
                            id={deletable ? '' : 'deleteDisabled'}
                            data-cy='delete-menu'
                        >
                            <div>Delete</div>
                        </Dropdown.Item>
                    )}
                />
            </Dropdown.Menu>
        </Dropdown>
    );
}

EllipsisMenu.propTypes = {
    handleEdit: PropTypes.func.isRequired,
    handleDelete: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
    deletable: PropTypes.bool.isRequired,
};


export default EllipsisMenu;
