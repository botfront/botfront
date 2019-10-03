import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';

import {
    Dropdown, Button, Message, Icon,
} from 'semantic-ui-react';

import { Projects } from '../../../api/project/project.collection';

import { getNluModelLanguages } from '../../../api/nlu_model/nlu_model.utils';


const ExportProject = ({
    projectId, projectLanguages, setLoading,
}) => {
    const [exportType, setExportType] = useState({});
    const [exportLanguage, setExportLanguage] = useState('');
    const [ExportSuccessful, setExportSuccessful] = useState(false);

    const exportTypeOptions = [
        {
            key: 'botfront',
            text: 'Export for Botfront',
            value: 'botfront',
            buttonText: 'Export project for Botfront',
            successText: 'Your project has been successfully exported for Botfront!',
        },
        {
            key: 'rasa',
            text: 'Export for Rasa/Rasa X',
            value: 'rasa',
            buttonText: 'Export project for Rasa/Rasa X',
            successText: 'Your project has been successfully exported for Rasa/Rasa X!',
        },
    ];

    const getLanguageOptions = () => (
        projectLanguages.map(({ value, text }) => ({
            key: value,
            text,
            value,
        }))
    );

    const validateExportType = () => {
        if (!exportTypeOptions.some(({ value }) => value === exportType.value)) {
            return false;
        }
        return true;
    };

    const validateLanguage = () => {
        if (
            exportType.value === 'rasa'
            && !getLanguageOptions().some(({ value }) => value === exportLanguage)
        ) {
            return false;
        }
        return true;
    };

    const exportForBotfront = () => {
        setLoading(true);
        console.log('----BOTFRONT EXPORT----');
        console.log(projectId);
        setExportSuccessful(true);
        setLoading(false);
    };

    const exportForRasa = () => {
        setLoading(true);
        console.log('----RASA EXPORT----');
        console.log(projectId);
        console.log(exportLanguage);
        setExportSuccessful(true);
        setLoading(false);
    };

    const exportProject = () => {
        if (exportType.value === 'botfront') exportForBotfront();
        if (exportType.value === 'rasa') exportForRasa();
    };

    const handleDropdownOnChange = (x, { value }) => {
        setExportType(exportTypeOptions.find(option => option.value === value) || {});
    };
    const exportButton = (
        <Button onClick={exportProject} className='export-option' data-cy='export-button'>
            <Icon name='download' />
            {exportType.buttonText}
        </Button>
    );

    if (ExportSuccessful) {
        return (
            <Message
                positive
                icon='check circle'
                header={exportTypeOptions.find(option => option.value === exportType.value).successText}
            />
        );
    }
    return (
        <>
            <Dropdown
                data-cy='export-type-dropdown'
                key='format'
                className='export-option'
                options={
                    exportTypeOptions.map(({ value, text, key }) => ({ value, text, key }))
                }
                placeholder='Select a format'
                selection
                onChange={handleDropdownOnChange}
            />
            <br />
            {exportType.value === 'rasa' && (
                <>
                    <Dropdown
                        data-cy='export-language-dropdown'
                        key='language'
                        className='export-option'
                        options={getLanguageOptions()}
                        placeholder='select a language'
                        selection
                        onChange={(x, { value }) => { setExportLanguage(value); }}
                    />
                    <br />
                </>
            )}
            {exportType.value === 'rasa' && validateLanguage() && (
                <>{exportButton}</>
            )}
            {exportType.value === 'botfront' && (
                <>{exportButton}</>
            )}
        </>
    );
};

ExportProject.propTypes = {
    projectId: PropTypes.string.isRequired,
    projectLanguages: PropTypes.array.isRequired,
    setLoading: PropTypes.func.isRequired,
};

const ExportProjectContainer = withTracker(({ projectId }) => {
    const project = Projects.findOne({ _id: projectId });
    const projectLanguages = getNluModelLanguages(project.nlu_models, true)
        .map(({ value, text }) => ({ key: value, text, value }));
    return {
        projectLanguages,
    };
})(ExportProject);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(ExportProjectContainer);
