import React from 'react';
import PropTypes from 'prop-types';

import { Menu } from 'semantic-ui-react';

import LanguageDropdown from '../common/LanguageDropdown';

const TopMenu = ({
    projectLanguages,
    selectedLanguage,
    handleLanguageChange,
    tab,
    className,
    children,
}) => (
    <Menu borderless className={`top-menu ${className}`}>
        <div className='language-container'>
            <Menu.Item header borderless className='language-item'>
                {tab === 'conversations' ? (
                    <></>
                ) : (
                    <LanguageDropdown
                        languageOptions={projectLanguages}
                        selectedLanguage={selectedLanguage}
                        handleLanguageChange={handleLanguageChange}
                    />
                )}
            </Menu.Item>
        </div>
        <div className='incoming-tabs'>
            {children}
        </div>


    </Menu>
);

TopMenu.propTypes = {
    projectLanguages: PropTypes.array.isRequired,
    selectedLanguage: PropTypes.string,
    handleLanguageChange: PropTypes.func.isRequired,
    tab: PropTypes.string,
    className: PropTypes.string,
    children: PropTypes.element,
};

TopMenu.defaultProps = {
    tab: '',
    selectedLanguage: '',
    className: '',
    children: <></>,
};

export default TopMenu;
