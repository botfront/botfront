import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';

import {
    Dropdown, Button, Message, Icon, Header,
} from 'semantic-ui-react';

import { Projects } from '../../../api/project/project.collection';


import { getNluModelLanguages } from '../../../api/nlu_model/nlu_model.utils';

import ImportDropField from './importProjectDropfield';

const ImportProject = ({
    projectLanguages,
    setLoading,
}) => {
    const importTypeOptions = [
        {
            key: 'botfront',
            text: ' Import Botfront project',
            value: 'botfront',
        },
        // {
        //     key: 'rasa',
        //     text: 'Import Rasa/Rasa X project',
        //     value: 'rasa',
        // },
    ];

    const [importType, setImportType] = useState('');
    const [importLanguage, setImportLanguage] = useState('');
    const [botfrontFileSuccess, setBotfrontFileSuccess] = useState(false);
    const [backupDownloaded, setbackupDownloaded] = useState(false);
    const [importSuccessful, setImportSuccessful] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState({});


    const getLanguageOptions = () => (
        projectLanguages.map(({ value, text }) => ({
            key: value,
            text,
            value,
        }))
    );

    const validateImportType = () => {
        if (!importTypeOptions.some(({ value }) => value === importType)) {
            return false;
        }
        return true;
    };

    const validateImportLanguage = () => {
        if (
            importType === 'rasa'
            && !getLanguageOptions().some(({ value }) => value === importLanguage)) {
            return false;
        }
        return true;
    };

    const validateFiles = () => {
        if (importType === 'botfront' && botfrontFileSuccess) {
            return true;
        }
        return false;
    };

    const importProject = () => {
        setLoading(true);
        console.log('importing...');
        console.log(uploadedFiles);
        setLoading(false);
        setImportSuccessful(true);
    };

    const fileAdded = (file) => {
        console.log('new file added');
        setUploadedFiles({ ...uploadedFiles, ...file });
        setBotfrontFileSuccess(true);
    };

    const verifyBotfrontFile = (file) => {
        console.log(file);
        return true;
    };

    const backupProject = () => {
        setbackupDownloaded(true);
    };

    const backupMessage = (backupDownloaded
        ? (
            <>
                <Message
                    positive
                    icon
                >
                    <Icon name='check circle' />
                    <Message.Content>
                        <Header>
                            Backup successfully downloaded
                        </Header>
                    </Message.Content>
                </Message>
            </>
        )
        : (
            <>
                <Message
                    warning
                    icon
                >
                    <Icon name='exclamation circle' />
                    <Message.Content>
                        <Header>
                            Your project will be overwritten
                        </Header>
                        Please use the button below to download a backup before proceeding
                    </Message.Content>
                </Message>
                <Button onClick={backupProject} className='export-option'>
                    Backup project
                </Button>
                <br />
            </>
        )
    );
    if (importSuccessful) {
        return (
            <Message positive icon className='import-successful'>
                <Icon name='check circle' />
                <Message.Content>
                    <Header>Import Successfull</Header>
                </Message.Content>
            </Message>
        );
    }

    return (
            <>
                <Dropdown
                    key='format'
                    className='export-option'
                    options={importTypeOptions}
                    placeholder='Select a format'
                    selection
                    onChange={(x, { value }) => { setImportType(value); }}
                />
                <br />
                {importType === 'rasa' && (
                    <>
                        <Dropdown
                            key='language'
                            className='export-option'
                            options={getLanguageOptions()}
                            placeholder='select a language'
                            selection
                            onChange={(x, { value }) => { setImportLanguage(value); }}
                        />
                        <br />
                    </>
                )}
                {(importType === 'botfront' && validateImportType()) && (
                    <ImportDropField
                        onChange={fileAdded}
                        text='Drop your Botfront project in JSON format here. Data should not be larger than 30 Mb.'
                        manipulateData={JSON.parse}
                        verifyData={verifyBotfrontFile}
                        success={botfrontFileSuccess}
                        fileTag='botfront'
                    />
                )}
                {importType === 'botfront' && botfrontFileSuccess && (
                    <>
                        {backupMessage}
                    </>
                )}
                {(importType === 'rasa'
                    ? validateImportType() && validateImportLanguage() && validateFiles()
                    : validateImportType() && validateFiles()) && (
                    <Button onClick={importProject} disabled={!backupDownloaded} className='export-option'>
                        Import
                    </Button>
                )}
            </>
    );
};

ImportProject.propTypes = {
    projectId: PropTypes.string.isRequired,
    projectLanguages: PropTypes.array,
    setLoading: PropTypes.func.isRequired,
};

ImportProject.defaultProps = {
    projectLanguages: [],
};

const ImportProjectContainer = withTracker(({ projectId }) => {
    const project = Projects.findOne({ _id: projectId });
    const projectLanguages = getNluModelLanguages(project.nlu_models, true);
    return {
        projectLanguages,
    };
})(ImportProject);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(ImportProjectContainer);
