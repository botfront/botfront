import React from 'react';
import PropTypes from 'prop-types';
import {
    Breadcrumb, Menu,
} from 'semantic-ui-react';


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
            {/* <Icon name={`triangle ${collapsed ? 'right' : 'down'}`} onClick={() => onToggleCollapsed(!collapsed)} /> */}
            {formName && slotName && (
                <Breadcrumb
                    data-cy='form-slot-name'
                    className='form-slot-breadcrumb'
                    icon='right angle'
                    sections={[formName, slotName]}
                />
            )}
            <Menu.Menu className='form-editor-tab-menu'>
                {menuItems.map(renderMenuItem)}
            </Menu.Menu>
        </Menu>
    );
};

FormTopMenu.propTypes = {
    formName: PropTypes.string,
    slotName: PropTypes.string,
    activeItem: PropTypes.string,
    setActiveItem: PropTypes.func.isRequired,
    menuItems: PropTypes.array.isRequired,
};

FormTopMenu.defaultProps = {
    formName: null,
    slotName: null,
    activeItem: 'question',
};

export default FormTopMenu;
