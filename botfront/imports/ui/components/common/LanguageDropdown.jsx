import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { setWorkingLanguage } from '../../store/actions/actions';
import { ProjectContext } from '../../layouts/context';

const LanguageDropdown = ({
    selectedLanguage: oldSelectedLanguage,
    handleLanguageChange: oldHandleLanguageChange,
    languageOptions: oldLanguageOptions,
    newSelectedLanguage,
    newHandleLanguageChange,
    multiple,
}) => {
    const {
        projectLanguages: newLanguageOptions,
    } = useContext(ProjectContext);

    const selectedLanguage = oldSelectedLanguage || newSelectedLanguage;
    const handleLanguageChange = oldHandleLanguageChange || newHandleLanguageChange;
    const languageOptions = oldLanguageOptions || newLanguageOptions;

    if (languageOptions.length < 2) return null;
    return (
        <Dropdown
            className='language-dropdown'
            placeholder='Select Langugage'
            search
            selection
            multiple={multiple}
            value={selectedLanguage}
            options={languageOptions}
            onChange={(_e, { value }) => handleLanguageChange(value)}
            data-cy='language-selector'
        />
    );
};

LanguageDropdown.propTypes = {
    selectedLanguage: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    languageOptions: PropTypes.array,
    multiple: PropTypes.bool,
    handleLanguageChange: PropTypes.func,
    newSelectedLanguage: PropTypes.string,
    newHandleLanguageChange: PropTypes.func.isRequired,
};

LanguageDropdown.defaultProps = {
    selectedLanguage: null,
    newSelectedLanguage: '',
    languageOptions: null,
    handleLanguageChange: null,
    multiple: false,
};

const mapStateToProps = state => ({
    newSelectedLanguage: state.settings.get('workingLanguage'),
});

const mapDispatchToProps = {
    newHandleLanguageChange: setWorkingLanguage,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(LanguageDropdown);
