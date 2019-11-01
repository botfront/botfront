import React from 'react';
import PropTypes from 'prop-types';

import { Menu } from 'semantic-ui-react';


import LanguageDropdown from '../common/LanguageDropdown';
import EnvSelector from '../common/EnvSelector';

const TopMenu = ({
    projectLanguages, selectedModel, handleLanguageChange, selectedEnvironment, handleEnvChange, projectEnvironments,
}) => (
    <Menu borderless className='top-menu'>
        <Menu.Item header>
            <LanguageDropdown
                languageOptions={projectLanguages}
                selectedLanguage={selectedModel.language}
                handleLanguageChange={handleLanguageChange}
            />
        </Menu.Item>
        <Menu.Item header className='env-select'>
            <EnvSelector
                availableEnvs={projectEnvironments}
                envChange={handleEnvChange}
                value={selectedEnvironment}
            />
        </Menu.Item>
    </Menu>
);

TopMenu.propTypes = {
    projectLanguages: PropTypes.array.isRequired,
    selectedModel: PropTypes.object.isRequired,
    handleLanguageChange: PropTypes.func.isRequired,
    projectEnvironments: PropTypes.array.isRequired,
    handleEnvChange: PropTypes.func.isRequired,
    selectedEnvironment: PropTypes.string.isRequired,
};

export default TopMenu;
