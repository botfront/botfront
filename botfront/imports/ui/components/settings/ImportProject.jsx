import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';
import { saveAs } from 'file-saver';


import {
    Dropdown, Button, Message, Icon,
} from 'semantic-ui-react';

import { Projects } from '../../../api/project/project.collection';
import { getNluModelLanguages } from '../../../api/nlu_model/nlu_model.utils';

import ImportDropField from './importProjectDropfield';

const ImportProject = ({
    // projectLanguages,
    setLoading,
    apiHost,
    projectId,
}) => {
    const importTypeOptions = [
        {
            key: 'botfront',
            text: ' Import Botfront project',
            value: 'botfront',
            successText: 'Your current project has been overwritten.',
            successHeader: 'Botfront import successful!',
        },
        // {
        //     key: 'rasa',
        //     text: 'Import Rasa/Rasa X project',
        //     value: 'rasa',
        // },
    ];

    const [importType, setImportType] = useState({});
    const [botfrontFileSuccess, setBotfrontFileSuccess] = useState(false);
    const [backupDownloaded, setbackupDownloaded] = useState(false);
    const [importSuccessful, setImportSuccessful] = useState(undefined);
    const [importErrorMessage, setImportErrorMessage] = useState({ header: 'Import failed' });
    const [uploadedFiles, setUploadedFiles] = useState({ header: 'Import Failed', text: '' });

    const validateImportType = () => {
        if (!importTypeOptions.some(({ value }) => value === importType.value)) {
            return false;
        }
        return true;
    };

    // const getImportType = value => (
    //     importTypeOptions.find(options => options.value === value)
    // );

    const importProject = () => {
        setLoading(true);
        Meteor.call('importProject', uploadedFiles.botfront, apiHost, (error, { success, errorMessage }) => {
            if (success === true) {
                setImportSuccessful(true);
            } else {
                setImportSuccessful(false);
                setImportErrorMessage(!!errorMessage ? errorMessage : importErrorMessage);
            }
            setLoading(false);
        });
    };

    const fileAdded = (file) => {
        setUploadedFiles({ ...uploadedFiles, ...file });
        setBotfrontFileSuccess(true);
    };

    const verifyBotfrontFile = (file) => {
        if (typeof file === 'object') {
            return true;
        }
        return false;
    };

    const backupProject = () => {
        Meteor.call('exportProject', apiHost, (err, jsonFile) => {
            const blob = new Blob([jsonFile], { type: 'text/plain;charset=utf-8' });
            const filename = `BotfrontProjectBackup_${projectId}.json`;
            saveAs(blob, filename);
        });
        setbackupDownloaded(true);
    };

    const importButtonText = () => {
        if (importType.value === 'botfront') {
            return 'Import Botfront project';
        }
        return 'Import project';
    };
    
    const refreshImportPage = () => {
        setImportType({});
        setBotfrontFileSuccess(false);
        setbackupDownloaded(false);
        setImportSuccessful(undefined);
        setImportErrorMessage({});
        setUploadedFiles({});
    };

    if (importSuccessful === true) {
        return (
            <>
                <Message
                    positive
                    className='import-result-message'
                    icon='check circle'
                    header={importType.successHeader}
                    content={importTypeOptions.successText}
                    data-cy='project-import-success'
                />
                <Button onClick={refreshImportPage}><Icon name='upload' />Import again</Button>
            </>
        );
    }
    if (importSuccessful === false) {
        return (
            <>
                <Message
                    error
                    className='import-result-message'
                    icon='times circle'
                    header={importErrorMessage.header}
                    content={importErrorMessage.text}
                    data-cy='project-import-fail'
                />
                <Button onClick={refreshImportPage}><Icon name='upload' />Import a different file</Button>
            </>
        );
    }

    return (
            <>
                <Dropdown
                    data-cy='import-type-dropdown'
                    key='format'
                    className='export-option'
                    options={importTypeOptions.map(({ value, key, text }) => ({ value, key, text }))}
                    placeholder='Select a format'
                    selection
                    onChange={(x, { value }) => {
                        setImportType(importTypeOptions.find(options => options.value === value));
                    }}
                />
                <br />
                {importType.value === 'botfront' && (
                    <ImportDropField
                        onChange={fileAdded}
                        text='Drop your Botfront project in JSON format here. Data should not be larger than 30 Mb.'
                        manipulateData={JSON.parse}
                        verifyData={verifyBotfrontFile}
                        success={botfrontFileSuccess}
                        fileTag='botfront'
                        successMessage='Your Botfront project file is ready.'
                    />
                )}
                { !backupDownloaded && botfrontFileSuccess && (
                    <>
                        <Message
                            warning
                            icon='exclamation circle'
                            header='Your project will be overwritten.'
                            content='Please use the button below to download a backup before proceeding.'
                        />
                        <Button onClick={backupProject} className='export-option' data-cy='backup-project-button'>
                            <Icon name='download' />
                            Backup current project
                        </Button>
                        <br />
                    </>
                )}
                {backupDownloaded && (
                    <Message
                        positive
                        icon='check circle'
                        header='Backup successfully downloaded!'
                        content={<p>If the download did not automatically start click<a href={`${apiHost}/project/bf/export`}> here </a> to retry.<br />Please verify that the backup has downloaded before continuing.</p>}
                    />
                )}
                {validateImportType() && (
                    <Button
                        onClick={importProject}
                        disabled={!backupDownloaded}
                        className='export-option'
                        data-cy='import-button'
                    >
                        <Icon name='upload' />
                        {importButtonText()}
                    </Button>
                )}
            </>
    );
};

ImportProject.propTypes = {
    projectId: PropTypes.string.isRequired,
    projectLanguages: PropTypes.array,
    setLoading: PropTypes.func.isRequired,
    apiHost: PropTypes.string.isRequired,
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
