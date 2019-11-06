import React from 'react';
import PropTypes from 'prop-types';

import { Menu } from 'semantic-ui-react';


import LanguageDropdown from '../common/LanguageDropdown';

const TopMenu = ({ projectLanguages, selectedLanguage, handleLanguageChange, tab }) => (
    <Menu borderless className='top-menu'>
        <Menu.Item header>
            {tab === 'conversations' ?
                <></> : <LanguageDropdown
                    languageOptions={projectLanguages}
                    selectedLanguage={selectedLanguage}
                    handleLanguageChange={handleLanguageChange}
                />}

        </Menu.Item>
    </Menu>
);

TopMenu.propTypes = {
    projectLanguages: PropTypes.array.isRequired,
    selectedLanguage: PropTypes.object.isRequired,
    handleLanguageChange: PropTypes.func.isRequired,
    tab: PropTypes.string
};

TopMenu.defaultProps = {
    tab: ''
};

export default TopMenu;
