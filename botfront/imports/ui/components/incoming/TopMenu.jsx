import React from 'react';
import PropTypes from 'prop-types';

import { Menu } from 'semantic-ui-react';

import LanguageDropdown from '../common/LanguageDropdown';
import EnvSelector from '../common/EnvSelector';

import { can } from '../../../lib/scopes';

const TopMenu = ({
    projectId,
    projectLanguages,
    selectedLanguage,
    handleLanguageChange,
    activeTab,
    tabs,
    onClickTab,
    className,
    selectedEnvironment,
    handleEnvChange,
    projectEnvironments,
}) => {
    const renderTabs = () => (
        tabs.map(({ value, text, role }) => (
            (!role || can(role, projectId))
                ? (
                    <Menu.Item
                        content={text}
                        key={value}
                        data-cy={value}
                        active={value === activeTab}
                        onClick={() => onClickTab(value)}
                    />
                )
                : <></>
        ))
    );
    return (
        <Menu borderless className={`top-menu ${className}`}>
            <div className='language-container'>
                {activeTab === 'conversations' ? (
                    <></>
                ) : (
                    <Menu.Item header borderless className='language-item'>
                        <LanguageDropdown
                            languageOptions={projectLanguages}
                            selectedLanguage={selectedLanguage}
                            handleLanguageChange={handleLanguageChange}
                        />
                    </Menu.Item>
                )}
                <Menu.Item header className='env-select'>
                    {['populate'].includes(activeTab) ? (
                        <></>
                    ) : (
                        <EnvSelector
                            availableEnvs={projectEnvironments}
                            envChange={handleEnvChange}
                            value={selectedEnvironment}
                        />
                    )}
                </Menu.Item>
            </div>
            <div className={`incoming-tabs ${can('projects:w', projectId) && 'spaced'}`}>
                {renderTabs()}
            </div>
        </Menu>
    );
};

TopMenu.propTypes = {
    projectId: PropTypes.string.isRequired,
    projectLanguages: PropTypes.array.isRequired,
    selectedLanguage: PropTypes.string,
    handleLanguageChange: PropTypes.func.isRequired,
    projectEnvironments: PropTypes.array.isRequired,
    handleEnvChange: PropTypes.func.isRequired,
    selectedEnvironment: PropTypes.string.isRequired,
    activeTab: PropTypes.string,
    tabs: PropTypes.array,
    className: PropTypes.string,
    onClickTab: PropTypes.func,
};

TopMenu.defaultProps = {
    selectedLanguage: '',
    className: '',
    activeTab: null,
    tabs: [],
    onClickTab: () => {},
};

export default TopMenu;
