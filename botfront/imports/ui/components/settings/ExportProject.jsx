import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { saveAs } from 'file-saver';
import {
    Dropdown, Button, Message, Icon,
} from 'semantic-ui-react';
import JSZIP from 'jszip';
import { ProjectContext } from '../../layouts/context';

const ExportProject = ({
    setLoading,
}) => {
    const { projectLanguages, language, project: { _id: projectId } } = useContext(ProjectContext);

    const [exportLanguage, setExportLanguage] = useState(projectLanguages.length > 1 ? 'all' : language);
    const [ExportSuccessful, setExportSuccessful] = useState(undefined);
    const [errorMessage, setErrorMessage] = useState({
        header: 'Export Failed',
        text: 'There was an unexpected error in the api request.',
    });


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


    const exportForRasa = () => {
        setLoading(true);
        Meteor.call('exportRasa', projectId, exportLanguage, (err, rasaDataZip) => {
            if (err) {
                setErrorMessage({ header: 'Rasa Export Failed!', text: err.message });
                setExportSuccessful(false);
                setLoading(false);
            } else {
                const zip = new JSZIP();
                zip.loadAsync(rasaDataZip, { base64: true }).then((newZip) => {
                    newZip.generateAsync({ type: 'blob' })
                        .then((blob) => {
                            saveAs(blob, `${projectId}_RasaExport.zip`);
                        });
                });
              
                setExportSuccessful(true);
                setLoading(false);
            }
        });
    };
    

    if (ExportSuccessful === true) {
        return (
            <Message
                data-cy='export-success-message'
                positive
                icon='check circle'
                header='Your project has been successfully exported'
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
            
            <br />
             
            <Button
                onClick={exportForRasa}
                className='export-option'
                data-cy='export-button'
            >
                <Icon name='download' />
                    Export project for Rasa/Rasa X
            </Button>
            
           
        </>
    );
};

ExportProject.propTypes = {
    setLoading: PropTypes.func.isRequired,
};

export default ExportProject;
