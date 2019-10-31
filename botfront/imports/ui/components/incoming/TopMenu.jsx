import React from 'react';
import PropTypes from 'prop-types';

import { Menu } from 'semantic-ui-react';


import LanguageDropdown from '../common/LanguageDropdown';

const TopMenu = ({ projectLanguages, selectedModel, handleLanguageChange }) => (
    <Menu borderless className='top-menu'>
        <Menu.Item header>
            <LanguageDropdown
                languageOptions={projectLanguages}
                selectedLanguage={selectedModel.language}
                handleLanguageChange={handleLanguageChange}
            />
        </Menu.Item>
    </Menu>
);

TopMenu.propTypes = {
    projectLanguages: PropTypes.array.isRequired,
    selectedModel: PropTypes.object.isRequired,
    handleLanguageChange: PropTypes.func.isRequired,
};

export default TopMenu;
