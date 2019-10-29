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
    const [backupSuccess, setbackupSuccess] = useState(undefined);
    const [backupErrorMessage, setBackupErrorMessage] = useState({ header: 'Backup failed!', text: '' });
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
        Meteor.call('importProject', uploadedFiles.botfront, apiHost, projectId, (error, { success, errorMessage }) => {
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

    const backupProject = (withConversations = true) => {
        const options = withConversations ? {} : { conversations: false };
        Meteor.call('exportProject', apiHost, projectId, options, (err, { data, error }) => {
            if (data) {
                const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
                const filename = `BotfrontProjectBackup_${projectId}.json`;
                saveAs(blob, filename);
                setbackupSuccess(true);
                return;
            }
            if (error) {
                setBackupErrorMessage(error);
            }
            setbackupSuccess(false);
        });
    };

    const importButtonText = () => {
        if (importType.value === 'botfront') {
            return 'Import Botfront project';
        }
        return 'Import project';
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
                {backupSuccess === true && (
                    <Message
                        positive
                        icon='check circle'
                        header='Backup successfully downloaded!'
                        content={(
                            <p>
                                If the download did not automatically start click
                                <a href={`${apiHost}/project/${projectId}/export`} data-cy='backup-link'> here </a>
                                to retry.<br />
                                Please verify that the backup has downloaded before continuing.
                            </p>
                        )}
                    />
                )}
                {(backupSuccess === false && (
                    <Message
                        error
                        icon='times circle'
                        header='Backup Failed'
                        content={backupErrorMessage.text}
                    />
                ))}
                {backupSuccess === undefined && botfrontFileSuccess && (
                    <Message
                        warning
                        icon='exclamation circle'
                        header='Your project will be overwritten.'
                        content='Please use the button below to download a backup before proceeding.'
                    />
                )}
                { backupSuccess === undefined && botfrontFileSuccess && (
                    <>
                        <Button.Group>
                            <Button onClick={backupProject} className='export-option' data-cy='export-button'>
                                Export with conversations
                            </Button>
                            <Button.Or />
                            <Button onClick={() => backupProject(false)} className='export-option'>
                                Export without conversations
                            </Button>
                            <Button.Or />
                            <Button onClick={() => setbackupSuccess('skipped')} className='export-option' data-cy='skip' negative>
                                Skip
                            </Button>
                        </Button.Group>
                        <br />
                    </>
                )}
                {validateImportType() && (
                    <Button
                        onClick={importProject}
                        disabled={!backupSuccess}
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
