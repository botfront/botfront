import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';

import {
    Dropdown, Button, Message, Icon,
} from 'semantic-ui-react';

import { Projects } from '../../../api/project/project.collection';

import { getNluModelLanguages } from '../../../api/nlu_model/nlu_model.utils';

const exportTypeOptions = [
    {
        key: 'botfront',
        text: 'Export for Botfront',
        value: 'botfront',
        successText: 'Your project has been successfully exported for Botfront!',
        content: (
            <p>
                If your download does not start within 5 seconds click{' '}
                <a href='http://localhost:8080/project/bf/export' download>here </a>
                to retry
            </p>),
    },
    {
        key: 'rasa',
        text: 'Export for Rasa/Rasa X',
        value: 'rasa',
        successText: 'Your project has been successfully exported for Rasa/Rasa X!',
    },
];

const ExportProject = ({
    projectId, projectLanguages, setLoading, apiHost,
}) => {
    const [exportType, setExportType] = useState({});
    const [exportLanguage, setExportLanguage] = useState('');
    const [ExportSuccessful, setExportSuccessful] = useState(false);

    const getLanguageOptions = () => (
        projectLanguages.map(({ value, text }) => ({
            key: value,
            text,
            value,
        }))
    );

    const validateLanguage = () => (
        getLanguageOptions().some(({ value }) => value === exportLanguage)
    );

    const validateExportType = () => {
        if (exportType.value === 'rasa' && validateLanguage()) {
            return true;
        }
        return false;
    };

    const exportForBotfront = () => {
        setLoading(true);
        console.log(apiHost);
        window.location.href = `${apiHost}/project/bf/export`;
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

    if (ExportSuccessful) {
        return (
            <Message
                positive
                icon='check circle'
                header={exportType.successText}
                content={<>{exportType.content}</>}
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
            {validateExportType() && (
                <Button onClick={exportProject} className='export-option' data-cy='export-button'>
                    <Icon name='download' />
                    Export project for Rasa/Rasa X
                </Button>
            )}
            {exportType.value === 'botfront' && (
                <Button onClick={exportProject} className='export-option' data-cy='export-button'>
                    <Icon name='download' />
                    Export project for Botfront
                </Button>
            )}
        </>
    );
};

ExportProject.propTypes = {
    projectId: PropTypes.string.isRequired,
    projectLanguages: PropTypes.array.isRequired,
    setLoading: PropTypes.func.isRequired,
    apiHost: PropTypes.string.isRequired,
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
