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
}) => (
    <Menu borderless className={`top-menu ${className}`}>
        <Menu.Item header>
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
    </Menu>
);

TopMenu.propTypes = {
    projectLanguages: PropTypes.array.isRequired,
    selectedLanguage: PropTypes.string,
    handleLanguageChange: PropTypes.func.isRequired,
    tab: PropTypes.string,
    className: PropTypes.string,
};

TopMenu.defaultProps = {
    tab: '',
    selectedLanguage: '',
    className: '',
};

export default TopMenu;
