import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';


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
    const [importSuccessful, setImportSuccessful] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState({});

    const validateImportType = () => {
        console.log(importType);
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
        console.log('importing...');
        console.log(uploadedFiles);
        // fetch(`${apiHost}/project/bf/export`, { method: 'PUT', mode: 'no-cors' });
        Meteor.call('importProject', uploadedFiles.botfront, apiHost);
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
        window.location.href = `${apiHost}/project/bf/export`;
        setbackupDownloaded(true);
    };

    const importButtonText = () => {
        if (importType.value === 'botfront') {
            return 'Import Botfront project';
        }
        return 'Import project';
    };

    if (importSuccessful) {
        return (
            <Message
                positive
                className='import-successful'
                icon='check circle'
                header={importType.successHeader}
                content={importTypeOptions.successText}
                data-cy='project-imported'
            />
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
