import React from 'react';
import PropTypes from 'prop-types';
import { Menu } from 'semantic-ui-react';


const FormTopMenu = (props) => {
    const {
        activeItem,
        setActiveItem,
        menuItems,
    } = props;

    const renderMenuItem = (item) => {
        const { text, value } = item;
        return (
            <Menu.Item
                onClick={() => setActiveItem(value)}
                active={activeItem === value}
                className='story-card-tab'
                data-cy='form-top-menu-item'
                key={`${value}-menu-item`}
            >
                {text || value}
            </Menu.Item>
        );
    };
    return (
        <Menu pointing secondary attatched='top' className='form-top-menu story-card-topbar'>
            <Menu.Menu className='form-editor-tab-menu'>
                {menuItems.map(renderMenuItem)}
            </Menu.Menu>
        </Menu>
    );
};

FormTopMenu.propTypes = {
    activeItem: PropTypes.string,
    setActiveItem: PropTypes.func.isRequired,
    menuItems: PropTypes.array.isRequired,
};

FormTopMenu.defaultProps = {
    activeItem: 'question',
};

export default FormTopMenu;
