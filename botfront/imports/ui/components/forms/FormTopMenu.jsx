import React from 'react';
import PropTypes from 'prop-types';
import { Segment, Breadcrumb, Menu } from 'semantic-ui-react';

const FormTopMenu = (props) => {
    const {
        formName,
        slotName,
        activeItem,
        setActiveItem,
        menuItems,
    } = props;

    const renderMenuItem = (item) => {
        const { text, value } = item;
        return (
            <Menu.Item onClick={() => setActiveItem(value)} active={activeItem === value}>
                {text || value}
            </Menu.Item>
        );
    };
    return (
        <Segment attatched='top' className='form-top-menu'>
            <Breadcrumb
                className='form-slot-breadcrumb'
                icon='right angle'
                sections={[formName, slotName]}
            />
            <Menu pointing secondary compact className='form-editor-tab-menu'>
                {menuItems.map(renderMenuItem)}
            </Menu>
        </Segment>
    );
};

FormTopMenu.propTypes = {
    formName: PropTypes.string,
    slotName: PropTypes.string,
    activeItem: PropTypes.string,
    setActiveItem: PropTypes.func,
    menuItems: PropTypes.array,
};

export default FormTopMenu;
