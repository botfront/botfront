import React from 'react';
import PropTypes from 'prop-types';
import {
    Breadcrumb, Menu, Icon,
} from 'semantic-ui-react';


const FormTopMenu = (props) => {
    const {
        formName,
        slotName,
        activeItem,
        setActiveItem,
        menuItems,
        collapsed,
        onToggleCollapsed,
    } = props;

    const renderMenuItem = (item) => {
        const { text, value } = item;
        return (
            <Menu.Item onClick={() => setActiveItem(value)} active={activeItem === value} className='story-card-tab'>
                {text || value}
            </Menu.Item>
        );
    };
    return (
        <Menu pointing secondary attatched='top' className='form-top-menu story-card-topbar'>
            <Icon name={`triangle ${collapsed ? 'right' : 'down'}`} onClick={() => onToggleCollapsed(!collapsed)} />
            {formName && slotName && (
                <Breadcrumb
                    className='form-slot-breadcrumb'
                    icon='right angle'
                    sections={[formName, slotName]}
                />
            )}
            <Menu.Menu compact className='form-editor-tab-menu'>
                {menuItems.map(renderMenuItem)}
            </Menu.Menu>
        </Menu>
    );
};

FormTopMenu.propTypes = {
    formName: PropTypes.string,
    slotName: PropTypes.string,
    activeItem: PropTypes.string,
    setActiveItem: PropTypes.func,
    menuItems: PropTypes.array,
    collapsed: PropTypes.bool,
    onToggleCollapsed: PropTypes.func,
};

export default FormTopMenu;
