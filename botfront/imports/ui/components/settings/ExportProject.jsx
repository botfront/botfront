import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { saveAs } from 'file-saver';
import {
    Dropdown, Button, Message, Icon, Checkbox,
} from 'semantic-ui-react';
import { ProjectContext } from '../../layouts/context';

const ExportProject = ({
    setLoading,
}) => {
    const { projectLanguages, language, project: { _id: projectId } } = useContext(ProjectContext);

    const getExportTypeOptions = () => [
        {
            key: 'botfront',
            text: 'Export for Botfront',
            value: 'botfront',
            successText: 'Your project has been successfully exported for Botfront!',
        },
        {
            key: 'rasa',
            text: 'Export for Rasa/Rasa X',
            value: 'rasa',
            successText: 'Your project has been successfully exported for Rasa/Rasa X!',
        },
    ];
    const [exportType, setExportType] = useState(getExportTypeOptions()[1]);
    const [exportLanguage, setExportLanguage] = useState(projectLanguages.length > 1 ? 'all' : language);
    const [ExportSuccessful, setExportSuccessful] = useState(undefined);
    const [errorMessage, setErrorMessage] = useState({
        header: 'Export Failed',
        text: 'There was an unexpected error in the api request.',
    });
    const toggles = {
        projectData: [...useState(true), 'Export project data (NLU, stories, responses)'],
        conversations: [...useState(false), 'Export conversations'],
        credentials: [...useState(false), 'Export credentials'],
        endpoints: [...useState(false), 'Export endpoints'],
        instances: [...useState(false), 'Export instances'],
    };

    const projectDataCols = [
        'models',
        'activity',
        'evaluations',
        'storyGroups',
        'stories',
        'slots',
        'corePolicies',
        'botResponses',
    ];

    const generateParamString = () => {
        let params = '';
        Object.keys(toggles).forEach((t) => {
            if (t === 'projectData' && !toggles.projectData[0]) {
                params += projectDataCols.map(c => `&${c}=0`).join('');
                params += '&thinProject=1';
            } else if (!toggles[t][0]) params += `&${t}=0`;
        });
        return params;
    };

    const paramsFromString = paramString => paramString.split('&').reduce((acc, curr) => {
        const [param, value] = curr.split('=');
        return {
            ...acc,
            ...(param && value ? { [param]: value } : {}),
        };
    }, {});

    const getLanguageOptions = () => [
        ...(projectLanguages.length > 1
            ? [{ value: 'all', text: 'All languages' }]
            : []),
        ...projectLanguages,
    ].map(({ value, text }) => ({
        key: value,
        text,
        value,
    }));

    const exportForBotfront = () => {
        setLoading(true);
        const exportOptions = paramsFromString(generateParamString());
        Meteor.call(
            'exportProject',
            projectId,
            exportOptions,
            (err, { data, error }) => {
                if (data) {
                    const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
                    const filename = `BotfrontProject_${projectId}.json`;
                    if (window.Cypress) {
                        setExportSuccessful(true);
                        setLoading(false);
                        return;
                    }
                    saveAs(blob, filename);
                    setExportSuccessful(true);
                    setLoading(false);
                    return;
                }
                if (error) {
                    setErrorMessage(error);
                    setExportSuccessful(false);
                    setLoading(false);
                    return;
                }
                setLoading(false);
                setExportSuccessful(false);
            },
        );
    };

    const exportForRasa = () => {
        setLoading(true);
        Meteor.call('exportRasa', projectId, exportLanguage, (err, rasaData) => {
            if (err) {
                setErrorMessage({ header: 'Rasa Export Failed!', text: err.message });
                setExportSuccessful(false);
                setLoading(false);
                return;
            }
            import('../utils/ZipFolder').then(({ ZipFolder }) => {
                const rasaZip = new ZipFolder();
                rasaData.fragments.forEach(f => rasaZip.addFile(
                    f.fragments,
                    rasaData.fragments.length > 1
                        ? `data/stories/${f.group
                            .replace(/ /g, '_')
                            .toLowerCase()}.yml`
                        : 'data/stories.yml',
                ));
                if (exportLanguage === 'all') {
                    Object.keys(rasaData.config).forEach(k => rasaZip.addFile(rasaData.config[k], `config-${k}.yml`));
                    Object.keys(rasaData.nlu).forEach(k => rasaZip.addFile(rasaData.nlu[k].data, `data/nlu/${k}.json`));
                } else {
                    rasaZip.addFile(rasaData.config[exportLanguage], 'config.yml');
                    rasaZip.addFile(rasaData.nlu[exportLanguage].data, 'data/nlu.json');
                }
                rasaZip.addFile(rasaData.endpoints, 'endpoints.yml');
                rasaZip.addFile(rasaData.credentials, 'credentials.yml');
                rasaZip.addFile(rasaData.domain, 'domain.yml');

                // prevents the file from being downloaded durring cypress tests
                if (window.Cypress) {
                    setExportSuccessful(true);
                    setLoading(false);
                    return;
                }
                rasaZip.downloadAs(`${projectId}_RasaExport.zip`, () => {
                    setExportSuccessful(true);
                    setLoading(false);
                });
            });
        });
    };

    const exportProject = () => {
        if (exportType.value === 'botfront') exportForBotfront();
        if (exportType.value === 'rasa') exportForRasa();
    };

    const handleDropdownOnChange = (x, { value }) => {
        setExportType(
            getExportTypeOptions().find(option => option.value === value) || {},
        );
    };

    const renderToggle = t => (
        <Checkbox
            toggle
            checked={toggles[t][0]}
            onChange={() => toggles[t][1](!toggles[t][0])}
            label={toggles[t][2]}
            className='export-option'
            key={t}
        />
    );

    if (ExportSuccessful === true) {
        return (
            <Message
                data-cy='export-success-message'
                positive
                icon='check circle'
                header={exportType.successText}
            />
        );
    }
    if (ExportSuccessful === false) {
        return (
            <Message
                data-cy='export-failure-message'
                error
                icon='times circle'
                header={errorMessage.header}
                content={<>{errorMessage.text}</>}
            />
        );
    }
    return (
        <>
            <Dropdown
                data-cy='export-type-dropdown'
                key='format'
                className='export-option'
                options={getExportTypeOptions().map(({ value, text, key }) => ({
                    value,
                    text,
                    key,
                }))}
                placeholder='Select a format'
                selection
                value={exportType.value}
                onChange={handleDropdownOnChange}
            />
            <br />
            {exportType.value === 'botfront'
                && Object.keys(toggles).map(t => (
                    <>
                        {renderToggle(t)}
                        <br />
                    </>
                ))}
            {exportType.value === 'rasa' && (
                <>
                    <Message
                        info
                        header='A few things to keep in mind when exporting for Rasa'
                        content={(
                            <>
                                <h5>NLU pipeline</h5>
                                <p>
                                    Consider removing Botfront specific NLU components,
                                    such as{' '}
                                    <b className='monospace'>
                                        rasa_addons.nlu.components.gazette.Gazette
                                    </b>
                                    .
                                </p>
                                <h5>Credentials and endpoints</h5>
                                <p>
                                    In most cases, you do not need to change credentials
                                    or endpoints. If you need to keep credentials from
                                    Botfront, be sure to keep the{' '}
                                    <b className='monospace'>rasa</b> and{' '}
                                    <b className='monospace'>rest</b> fields from the{' '}
                                    <b className='monospace'>credentials.yml</b> provided
                                    by Rasa X.
                                </p>
                            </>
                        )}
                    />
                    <Dropdown
                        data-cy='export-language-dropdown'
                        key='language'
                        className='export-option'
                        options={getLanguageOptions()}
                        placeholder='Select a language'
                        selection
                        value={exportLanguage}
                        onChange={(x, { value }) => {
                            setExportLanguage(value);
                        }}
                    />
                    <br />
                </>
            )}
            <br />
            {exportType.value === 'rasa' && (
                <Button
                    onClick={exportProject}
                    className='export-option'
                    data-cy='export-button'
                >
                    <Icon name='download' />
                    Export project for Rasa/Rasa X
                </Button>
            )}
            {exportType.value === 'botfront' && (
                <Button
                    onClick={exportProject}
                    className='export-option'
                    data-cy='export-button'
                >
                    <Icon name='download' />
                    Export project for Botfront
                </Button>
            )}
        </>
    );
};

ExportProject.propTypes = {
    setLoading: PropTypes.func.isRequired,
};

export default ExportProject;
