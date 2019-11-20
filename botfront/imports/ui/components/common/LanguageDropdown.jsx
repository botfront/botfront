import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic-ui-react';

const LanguageDropdown = ({
    languageOptions,
    selectedLanguage,
    handleLanguageChange,
}) => (
    <Dropdown
        className='language-dropdown'
        placeholder='Select Langugage'
        search
        selection
        value={selectedLanguage}
        options={languageOptions}
        onChange={(e, lang) => { handleLanguageChange(lang.value); }}
        data-cy='language-selector'
    />
);

LanguageDropdown.propTypes = {
    languageOptions: PropTypes.array.isRequired,
    selectedLanguage: PropTypes.string,
    handleLanguageChange: PropTypes.func.isRequired,
};

LanguageDropdown.defaultProps = {
    selectedLanguage: '',
};

export default LanguageDropdown;
