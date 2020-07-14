import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Loader, Menu } from 'semantic-ui-react';


export function Loading({ loading, children }) {
    return !loading ? children : <Loader active inline='centered' />;
}

Loading.propTypes = {
    loading: PropTypes.bool.isRequired,
};


export function PageMenu(props) {
    const {
        title, icon, children, className, headerDataCy,
    } = props;
    return (
        <Menu borderless className={`top-menu ${className}`}>
            <Menu.Menu className='page-name'>
                <Menu.Item>
                    <Menu.Header as='h3'>
                        <Icon name={icon} {...(headerDataCy ? { 'data-cy': headerDataCy } : {})} />
                        {` ${title}`}
                    </Menu.Header>
                </Menu.Item>
            </Menu.Menu>
            {children}
        </Menu>
    );
}

PageMenu.defaultProps = {
    children: null,
    className: '',
    headerDataCy: null,
};

PageMenu.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    className: PropTypes.string,
    headerDataCy: PropTypes.string,
};
