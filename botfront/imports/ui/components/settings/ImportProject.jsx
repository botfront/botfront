import React, { useState, useMemo } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { saveAs } from 'file-saver';

import {
    Dropdown, Button, Message, Icon, Confirm,
} from 'semantic-ui-react';

import ImportDropField from './importProjectDropfield';
import ImportRasaFiles from './ImportRasaFiles';

const { version } = require('/package.json');

const ImportProject = ({
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
        {
            key: 'rasa',
            text: 'Import Rasa/Rasa X project',
            value: 'rasa',
        },
    ];

    const [importType, setImportType] = useState(importTypeOptions[1]);
    const [botfrontFileSuccess, setBotfrontFileSuccess] = useState(false);
    const [backupSuccess, setbackupSuccess] = useState(undefined);
    const [backupErrorMessage, setBackupErrorMessage] = useState({ header: 'Backup failed!', text: '' });
    const [importSuccessful, setImportSuccessful] = useState(undefined);
    const [importErrorMessage, setImportErrorMessage] = useState({ header: 'Import failed' });
    const [uploadedFiles, setUploadedFiles] = useState({ header: 'Import Failed', text: '' });
    const [confirmSkipOpen, setConfirmSkipOpen] = useState(false);
    const [includeConvos, setIncludeConvos] = useState('conversations=true');

    const uploadedFileVersion = useMemo(() => {
        if (!uploadedFiles.botfront) return false;
        if (!uploadedFiles.botfront.bf_version) return false;
        return uploadedFiles.botfront.bf_version;
    }, [uploadedFiles]);

    const validateImportType = () => {
        if (!importTypeOptions.some(({ value }) => value === importType.value)) {
            return false;
        }
        return true;
    };

    const importProject = () => {
        setLoading(true);
        Meteor.call('importProject', uploadedFiles.botfront, apiHost, projectId, (err, result) => {
            console.log(result);
            if (!err) {
                setImportSuccessful(true);
            } else {
                setImportSuccessful(false);
                setImportErrorMessage({ header: 'Import failed', text: err.reason });
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
                if (window.Cypress) {
                    setbackupSuccess(true);
                    return;
                }
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
                    content={importType.successText}
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

    const renderImportBotfrontProject = () => (
        <>
            {importType.value === 'botfront' && !botfrontFileSuccess && (
                <ImportDropField
                    onChange={fileAdded}
                    manipulateData={JSON.parse}
                    verifyData={verifyBotfrontFile}
                    success={botfrontFileSuccess}
                    fileTag='botfront'
                    successMessage='Your Botfront project file is ready.'
                />
            )}
            {backupSuccess === true && (
                <p className='plain-text-message'>
                    If the backup download did not automatically start after 10 seconds, click
                    <a
                        href={`${apiHost}/project/${projectId}/export?output=json&conversations=${includeConvos}`}
                        data-cy='backup-link'
                    > here
                    </a> to retry.
                    <br />Please verify that the backup has downloaded before continuing.
                </p>
            )}
            {(backupSuccess === false && (
                <Message
                    error
                    icon='times circle'
                    header='Backup Failed'
                    content={backupErrorMessage.text}
                />
            ))}
            {backupSuccess === 'skipped' && (
                <Message
                    warning
                    icon='exclamation circle'
                    header='Warning!'
                    data-cy='skiped-backup-warning'
                    content={(
                        <>
                            All your current project data will be permanently overwritten and erased when you click
                            <b> Import Botfront Project. </b>
                        </>
                    )}
                />
            )}
            {backupSuccess === undefined && botfrontFileSuccess && (
                <Message
                    warning
                    icon='exclamation circle'
                    header='Your project will be overwritten.'
                    content={(
                        <>
                            <div>
                            It is highly advised to download a backup of your current project before importing a new one.<br /><br />
                            </div>
                            <div>
                            Current Botfront version: {version}<br />
                            File version: {uploadedFileVersion || <i>unknown</i>}
                            </div>
                        </>
                    )}
                />
            )}
            {backupSuccess === undefined && botfrontFileSuccess && (
                <>
                    <Button.Group>
                        <Button onClick={() => { backupProject(true); setIncludeConvos(true); }} className='export-option' data-cy='export-with-conversations'>
                            Download backup with conversations
                        </Button>
                        <Button.Or />
                        <Button onClick={() => { backupProject(false); setIncludeConvos(false); }} className='export-option' data-cy='export-without-conversations'>
                            Download backup without conversations
                        </Button>
                        <Button.Or />
                        <Button onClick={() => setConfirmSkipOpen(true)} className='export-option' data-cy='skip' negative>Skip</Button>
                        <Confirm
                            header='Are you sure you want to skip backing up your project?'
                            content='All your current project data will be permanently overwritten and erased.'
                            open={confirmSkipOpen}
                            onCancel={() => setConfirmSkipOpen(false)}
                            onConfirm={() => {
                                setbackupSuccess('skipped');
                                setConfirmSkipOpen(false);
                            }}
                        />
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

    return (
        <>
            <Dropdown
                data-cy='import-type-dropdown'
                key='format'
                className='export-option'
                options={importTypeOptions.map(({ value, key, text }) => ({ value, key, text }))}
                placeholder='Select a format'
                selection
                value={importType.value}
                onChange={(x, { value }) => {
                    setImportType(importTypeOptions.find(options => options.value === value));
                }}
            />
            <br />
            {importType.value === 'botfront' && renderImportBotfrontProject()}
            {importType.value === 'rasa' && <ImportRasaFiles />}
        </>
    );
};

ImportProject.propTypes = {
    projectId: PropTypes.string.isRequired,
    setLoading: PropTypes.func.isRequired,
    apiHost: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
    workingLanguage: state.settings.get('workingLanguage'),
});

export default connect(mapStateToProps)(ImportProject);
