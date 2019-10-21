import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic-ui-react';

const LanguageDropdown = ({
    languageOptions,
    selectedLanguage,
    handleLanguageChange,
}) => {
    return (
        <Dropdown
            placeholder='Select Langugage'
            search
            selection
            value={selectedLanguage}
            options={languageOptions}
            onChange={(e, lang) => { handleLanguageChange(lang.value); }}
            data-cy='model-selector'
        />
    );
};

LanguageDropdown.propTypes = {
    languageOptions: PropTypes.array.isRequired,
    selectedLanguage: PropTypes.string.isRequired,
    handleLanguageChange: PropTypes.func.isRequired,
};

export default LanguageDropdown;
