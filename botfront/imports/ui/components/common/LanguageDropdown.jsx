import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { setWorkingLanguage } from '../../store/actions/actions';
import { ProjectContext } from '../../layouts/context';

const LanguageDropdown = ({
    /*
        This component accepts a selectedLanguage, handleLanguageChange and languageOptions prop,
        but falls back to context default if not provided
    */
    selectedLanguage: specifiedSelectedLanguage,
    handleLanguageChange: specifiedHandleLanguageChange,
    languageOptions: specifiedLanguageOptions,
    defaultSelectedLanguage,
    defaultHandleLanguageChange,
    multiple,
}) => {
    const {
        projectLanguages: defaultLanguageOptions,
    } = useContext(ProjectContext);

    const selectedLanguage = specifiedSelectedLanguage || defaultSelectedLanguage;
    const handleLanguageChange = specifiedHandleLanguageChange || defaultHandleLanguageChange;
    const languageOptions = specifiedLanguageOptions || defaultLanguageOptions;

    // if (languageOptions.length < 2) return null;
    return (
        <Dropdown
            className='language-dropdown'
            placeholder='Select Langugage'
            search
            selection
            multiple={multiple}
            value={selectedLanguage}
            options={languageOptions}
            onChange={(_e, { value }) => {
                handleLanguageChange(value);
            }}
            data-cy='language-selector'
        />
    );
};

LanguageDropdown.propTypes = {
    selectedLanguage: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    languageOptions: PropTypes.array,
    multiple: PropTypes.bool,
    handleLanguageChange: PropTypes.func,
    defaultSelectedLanguage: PropTypes.string,
    defaultHandleLanguageChange: PropTypes.func.isRequired,
};

LanguageDropdown.defaultProps = {
    selectedLanguage: null,
    defaultSelectedLanguage: '',
    languageOptions: null,
    handleLanguageChange: null,
    multiple: false,
};

const mapStateToProps = state => ({
    defaultSelectedLanguage: state.settings.get('workingLanguage'),
});

const mapDispatchToProps = {
    defaultHandleLanguageChange: setWorkingLanguage,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(LanguageDropdown);
