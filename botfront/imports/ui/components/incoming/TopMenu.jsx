import React from 'react';
import PropTypes from 'prop-types';

import { Menu } from 'semantic-ui-react';

import LanguageDropdown from '../common/LanguageDropdown';
import EnvSelector from '../common/EnvSelector';

const TopMenu = ({
    projectLanguages, selectedLanguage, handleLanguageChange, tab, selectedEnvironment, handleEnvChange, projectEnvironments,
}) => (
    <Menu borderless className='top-menu'>
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
        <Menu.Item header className='env-select'>
            {['oos', 'populate'].includes(tab) ? (
                <></>
            ) : (
                <EnvSelector
                    availableEnvs={projectEnvironments}
                    envChange={handleEnvChange}
                    value={selectedEnvironment}
                />
            )}
        </Menu.Item>
    </Menu>
);

TopMenu.propTypes = {
    projectLanguages: PropTypes.array.isRequired,
    selectedLanguage: PropTypes.string,
    handleLanguageChange: PropTypes.func.isRequired,
    projectEnvironments: PropTypes.array.isRequired,
    handleEnvChange: PropTypes.func.isRequired,
    selectedEnvironment: PropTypes.string.isRequired,
    tab: PropTypes.string,
};

TopMenu.defaultProps = {
    tab: '',
    selectedLanguage: '',
};

export default TopMenu;
