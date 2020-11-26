import React, {
    useRef, useState, useContext, useEffect,
} from 'react';
import {
    Button,
    Dropdown,
    Segment,
    Label,
    Icon,
    Message,
    Divider,
    Dimmer,
    Loader,
    Popup,
    Checkbox,
    Accordion,
} from 'semantic-ui-react';
import { NativeTypes } from 'react-dnd-html5-backend-cjs';
import { useDrop } from 'react-dnd-cjs';
import { useMutation } from '@apollo/react-hooks';
import JSZIP from 'jszip';
import { saveAs } from 'file-saver';
import Alert from 'react-s-alert';
import { useFileReader } from './fileReaders';
import { ProjectContext } from '../../layouts/context';
import { unZipFile } from '../../../lib/importers/common';
import { importFilesMutation } from './graphql';
import { tooltipWrapper } from '../utils/Utils';
import 'react-s-alert/dist/s-alert-default.css';

const ImportRasaFiles = () => {
    const {
        projectLanguages, project: { _id: projectId, name: projectName }, language,
    } = useContext(ProjectContext);
    const [importFiles] = useMutation(importFilesMutation);
    const [fallbackImportLanguage, setFallbackImportLanguage] = useState(language);
    const [importResults, setImportResults] = useState([]);
    const [wipeInvolvedCollections, setwipeInvolvedCollections] = useState(false);
    const [wipeProject, setWipeProject] = useState(false);
    const [downloadBackup, setDownloadBackup] = useState(true);

    const [importSummary, setImportSummary] = useState([]);

    const [filesImporting, setFilesImporting] = useState(false);

    const validateFunction = async (files) => {
        // we don't want to send files with errors already so we filter those out
        // but we keep their index so it easy to recontruct the list
        const filesNotSentIndexes = [];
        const filesToSend = files.filter((file, index) => {
            if (file.errors && file.errors.length > 0) {
                filesNotSentIndexes.push(index);
                return false;
            }
            return true;
        });
        const validationResult = await importFiles({
            variables: {
                projectId,
                files: filesToSend,
                onlyValidate: true,
                wipeInvolvedCollections,
                wipeProject,
                fallbackLang: fallbackImportLanguage,
            },
        });
        const validationData = validationResult?.data?.import?.fileMessages;
        const summary = validationResult?.data?.import?.summary;
        setImportSummary(summary);
        if (validationData.length !== files.length) {
            // that means some files were not sent
            filesNotSentIndexes.forEach((index) => {
                validationData.splice(index, 0, files[index]); // so we re-insert those
            });
        }
        return validationData;
    };

    const handleImport = async ([files, setFileList]) => {
        if (downloadBackup) {
            const options = { conversations: true, incoming: true };
            const noSpaceName = projectName.replace(/ +/g, '_');
            try {
                const zipData = await Meteor.callWithPromise('exportRasa', projectId, 'all', options);
                const zip = new JSZIP();
                const date = (new Date()).toISOString();
                if (!window.Cypress) {
                    zip.loadAsync(zipData, { base64: true }).then((newZip) => {
                        newZip.generateAsync({ type: 'blob' })
                            .then((blob) => {
                                saveAs(blob, `${noSpaceName}_${date}.zip`);
                            });
                    });
                }
            } catch (e) {
                Alert.error('Exporting the project failed, so import was aborted to preserve data', { timeout: 10000, position: 'top-right' });
                return;
            }
        }
        setFilesImporting(true);
        const filesToImport = files.filter(
            file => !(file.errors && file.errors.length),
        );
        const importResult = await importFiles({
            variables: {
                projectId,
                files: filesToImport,
                wipeInvolvedCollections,
                wipeProject,
                fallbackLang: fallbackImportLanguage,
            },
        });
        setImportSummary([]);
        setFilesImporting(false);
        setFileList({ reset: true });
        const importResultMessages = importResult?.data?.import?.summary;
        setImportResults(importResultMessages);
    };

    const handleFileDrop = async (files, [fileList, setFileList]) => {
        const newValidFiles = Array.from(files);
        const filesWithUnziped = await newValidFiles.reduce(
            async (newFiles, currFile) => {
                if (currFile.name.match(/\.zip$/)) {
                    const filesFromZip = await unZipFile(currFile);
                    return [...newFiles, ...filesFromZip];
                }
                // since this reduce is async we need to await for the previous result
                return [...(await newFiles), currFile];
            },
            [],
        );
        const filesToAdd = filesWithUnziped.filter(
            f => f.size
                && !fileList.some(
                    // index on lastModified and filename
                    cf => cf.lastModified === f.lastModified && cf.filename === f.name,
                ),
        );
        setFileList({ add: filesToAdd });
    };

    const useFileDrop = fileReader => useDrop({
        accept: [NativeTypes.FILE],
        drop: item => handleFileDrop(item.files, fileReader),
        collect: monitor => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    const unpackSummaryEntry = (entry) => {
        const { text, longText } = entry;
        if (!longText) return text;
        return (
            <Accordion
                defaultActiveIndex={-1}
                panels={[
                    {
                        key: text,
                        title: { content: text },
                        content: { content: longText },
                    },
                ]}
            />
        );
    };

    const renderFileList = ([fileList, setFileList]) => {
        const filesWithErrors = fileList.filter(f => (f.errors || []).length);
        const filesWithWarnings = fileList.filter(f => (f.warnings || []).length);
    
        const colorOfLabel = (f) => {
            if (f.errors && f.errors.length) return { color: 'red' };
            if (f.warnings && f.warnings.length) return { color: 'yellow' };
            if (!f.validated) return { color: 'grey' };
            return { color: 'green' };
        };
        return (
            <div>
                {fileList.map(f => (
                    <Label
                        data-cy='label'
                        key={`${f.name}${f.lastModified}`}
                        className='file-label'
                        {...colorOfLabel(f)}
                        as='a'
                        onClick={e => e.stopPropagation()}
                    >
                        {f.name}
                        <Icon
                            name='delete'
                            onClick={() => setFileList({
                                delete: {
                                    filename: f.filename,
                                    lastModified: f.lastModified,
                                },
                            })
                            }
                        />
                    </Label>
                ))}
                {(filesWithErrors.length > 0 || filesWithWarnings.length > 0) && (
                    <Divider />
                )}
                {filesWithErrors.length > 0 && (
                    <>
                        <h4>The following files cannot be parsed and will be ignored:</h4>
                        {filesWithErrors.map((f) => {
                            const { name } = f;
                            const nameNoDot = name.replace(/\./g, '');

                            return (
                                <Message data-cy={`message-error-${nameNoDot}`} color='red' key={`errors-${name}`}>
                                    <Message.Header>{name}</Message.Header>
                                    <Message.List
                                        items={f.errors.map(unpackSummaryEntry)}
                                        className='import-summary-accordion'
                                    />
                                </Message>
                            );
                        })}
                    </>
                )}
                {filesWithWarnings.length > 0 && (
                    <>
                        <h4>The following files have warnings associated with them:</h4>
                        {filesWithWarnings.map((f) => {
                            const { name } = f;
                            const nameNoDot = name.replace(/\./g, '');
                            return (
                                <Message data-cy={`message-warning-${nameNoDot}`} color='yellow' key={`warnings-${name}`}>
                                    <Message.Header>{name}</Message.Header>
                                    <Message.List
                                        items={f.warnings.map(unpackSummaryEntry)}
                                        className='import-summary-accordion'
                                    />
                                </Message>
                            );
                        })}
                    </>
                )}
            </div>
        );
    };

    const fileReader = useFileReader({ validateFunction });
    const [fileList, setFileList] = fileReader;
    const [{ canDrop, isOver }, drop] = useFileDrop(fileReader);
    const fileField = useRef();
    useEffect(() => setFileList({ reload: true }), [wipeInvolvedCollections, fallbackImportLanguage]);

    const renderImportSection = () => (
        <Segment
            className={`import-box ${
                canDrop && isOver && !filesImporting ? 'upload-target' : ''
            }`}
        >
            <div {...(!filesImporting ? { ref: drop } : {})} data-cy='drop-zone-data' className='drop-zone-data'>
                {filesImporting ? (
                    <Dimmer active inverted>
                        <Loader>Importing data...</Loader>
                    </Dimmer>
                ) : (
                    <>
                        <input
                            type='file'
                            ref={fileField}
                            style={{ display: 'none' }}
                            multiple
                            onChange={e => handleFileDrop(e.target.files, fileReader)}
                        />
                        {fileList.length ? (
                            renderFileList(fileReader)
                        ) : (
                            <>
                                <div className='align-center'>
                                    <Icon
                                        name='database'
                                        size='huge'
                                        color='grey'
                                        style={{ marginBottom: '8px' }}
                                    />
                                    <Button
                                        primary
                                        basic
                                        content='Open File Browser'
                                        size='small'
                                        onClick={() => fileField.current.click()}
                                    />
                                    <span className='small grey'>
                                        or drop files to upload
                                    </span>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </Segment>
    );


    const warnWipe = () => {
        let message = null;
        if (wipeProject) message = 'Reset project is enabled';
        if (wipeInvolvedCollections) message = 'Delete existing data is enabled';
        if (message) {
            return (
                <Message warning>
                    <Message.Header>Wipe on import</Message.Header>
                    {message}
                </Message>
            );
        }
        return null;
    };

    const renderBottom = () => (
        <>
            {warnWipe()}
            <Message data-cy='message-summary' info>
                <Message.Header>Import summary</Message.Header>
                <Message.List
                    items={importSummary.map(unpackSummaryEntry)}
                    className='import-summary-accordion'
                />
                <br />
                <Checkbox
                    toggle
                    className='download-backup'
                    checked={downloadBackup}
                    onChange={() => setDownloadBackup(!downloadBackup)}
                    label='Download backup before the import'
                    data-cy='backup-project'
                />
                <br />
                <Button
                    disabled={fileReader[0].some(f => !f.validated)}
                    content='Import'
                    data-cy='import-files'
                    primary
                    onClick={() => handleImport(fileReader)}
                />
            </Message>
        </>
    );

    const renderImportResults = () => {
        if (importResults && importResults.length !== 0) {
            return (
                <Message error>
                    <Message.Header>Import Error</Message.Header>
                    <Message.List className='import-summary-accordion'>
                        {importResults.map(message => (<Message.Item>{message.text}</Message.Item>))}
                    </Message.List>
                </Message>
            );
        }
        return <></>;
    };

    const renderKnobs = () => (
        <Segment className='import-box'>
            <div className='side-by-side narrow left middle'>
                <Popup
                    content={(
                        <>
                            <p>
                                        Bot responses found in domain files will use the
                                        &apos;language&apos; attribute if it exists; if
                                        not, the fallback import language will be used.
                            </p>

                            <p>
                                        Likewise, the language of a NLU file can be
                                        specified in its first line; if it isn&apos;t, the
                                        fallback import language will be used.
                            </p>

                            <p>For more information, read the docs.</p>
                        </>
                    )}
                    inverted
                    trigger={(
                        <div>
                            <Icon name='question circle' />
                            <strong>Fallback import language: </strong>
                        </div>
                    )}
                />
                <Dropdown
                    className='export-option'
                    options={projectLanguages}
                    selection
                    value={fallbackImportLanguage}
                    onChange={(_e, { value }) => setFallbackImportLanguage(value)}
                />
            </div>
          
            <div className='wipes side-by-side left'>
                {tooltipWrapper(<Checkbox
                    toggle
                    checked={wipeInvolvedCollections}
                    onChange={() => {
                        if (wipeInvolvedCollections === false) { setWipeProject(false); }
                        setwipeInvolvedCollections(!wipeInvolvedCollections);
                    }}
                    label='Delete existing data'
                    data-cy='wipe-data'
                />, `This will clear the existing data for the type of data you are importing.
                e.g : importing stories with this switch on will remove the previous stories, but keep everything else, NLU, responses, etc`)}
                {tooltipWrapper(<Checkbox
                    toggle
                    checked={wipeProject}
                    onChange={() => {
                        if (wipeProject === false) { setwipeInvolvedCollections(false); }
                        setWipeProject(!wipeProject);
                    }}
                    label='Reset project'
                    data-cy='wipe-project'
                />, 'this will remove ALL project\'s data - including conversations - before importing')}
            </div>

        </Segment>
    );

    return (
        <>
            {renderKnobs()}
            {renderImportSection()}
            {!!importSummary.length && fileList.length > 0 && renderBottom()}
            {renderImportResults()}
        </>
    );
};

ImportRasaFiles.propTypes = {};

ImportRasaFiles.defaultProps = {};

export default ImportRasaFiles;
