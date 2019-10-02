import React from 'react';
import {
    Dropdown,
} from 'semantic-ui-react';


export const EllipisMenu = () => (
    <Dropdown
        id='ellipsis-icon'
        icon='ellipsis vertical'
        compact
    >
        <Dropdown.Menu id='ellipsis-menu'>
            <Dropdown.Item>Edit</Dropdown.Item>
            <Dropdown.Item>Delete</Dropdown.Item>
        </Dropdown.Menu>
    </Dropdown>
);


export default EllipisMenu;
