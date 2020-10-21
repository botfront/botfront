import React, {
    useRef, useState, useContext, useMemo, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
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
} from 'semantic-ui-react';
import { get as _get } from 'lodash';
import { NativeTypes } from 'react-dnd-html5-backend-cjs';
import { useDrop } from 'react-dnd-cjs';
import { useMutation } from '@apollo/react-hooks';
import { StoryGroups } from '../../../api/storyGroups/storyGroups.collection';
import { Slots } from '../../../api/slots/slots.collection';
import { getDefaultDomainAndLanguage } from '../../../lib/story.utils';
import { useFileReader } from './fileReaders';
import { handleImportAll } from './fileImporters';
import { ProjectContext } from '../../layouts/context';
import {
    unZipFile,
} from '../../../lib/importers/common';
import { importFilesMutation } from './graphQL';

const ImportRasaFiles = (props) => {
    const {
        existingStoryGroups, existingSlots, projectId, defaultDomain,
    } = props;
    const { projectLanguages, instance, language } = useContext(ProjectContext);
    const [importFiles] = useMutation(importFilesMutation);
    const [fallbackImportLanguage, setFallbackImportLanguage] = useState();
    useEffect(() => setFallbackImportLanguage(language), [language]);
    const [wipeCurrent, setWipeCurrent] = useState(false);

    const validateFunction = async (files) => {
        // we don't want to send files with errors already so we filter those out
        // but we keep their index so it easy to
        const filesNotSentIndexes = [];
        const filesToSend = files.filter((file, index) => {
            if (file.errors && file.errors.length > 0) {
                filesNotSentIndexes.push(index);
                return false;
            }
            return true;
        });
        const validationResult = await importFiles({ variables: { projectId, files: filesToSend, onlyValidate: true } });
        const validationData = validationResult?.data?.import?.fileMessages;
        if (validationData.length !== files.length) { // that means some files were not sent
            filesNotSentIndexes.forEach((index) => {
                validationData.splice(index, 0, files[index]); // so we re-insert those
            });
        }
        return validationData;
    };


    const importFunction = async (files) => {
        const importResult = await importFiles({ variables: { projectId, files, noValidate: true } });
        console.log(importResult);
    };

    const handleFileDrop = async (files, [fileList, setFileList]) => {
        const newValidFiles = Array.from(files).filter(
            f => f.size
                && !fileList.some(
                    // index on lastModified and filename
                    cf => cf.lastModified === f.lastModified && cf.filename === f.name,
                ),
        );
        
        const filesWithUnziped = await newValidFiles.reduce(async (newFiles, currFile) => {
            if (currFile.name.match(/\.zip$/)) {
                const filesFromZip = await unZipFile(currFile);
                return [...newFiles, ...filesFromZip];
            }
            
            return [...newFiles, currFile];
        }, []);
        setFileList({ add: filesWithUnziped });
    };

    const useFileDrop = fileReader => useDrop({
        accept: [NativeTypes.FILE],
        drop: item => handleFileDrop(item.files, fileReader),
        collect: monitor => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

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
                        {filesWithErrors.map(f => (
                            <Message color='red' key={`errors-${f.name}`}>
                                <Message.Header>{f.name}</Message.Header>
                                <Message.List items={f.errors} />
                            </Message>
                        ))}
                    </>
                )}
                {filesWithWarnings.length > 0 && (
                    <>
                        <h4>The following files have warnings associated with them:</h4>
                        {filesWithWarnings.map(f => (
                            <Message color='yellow' key={`warnings-${f.name}`}>
                                <Message.Header>{f.name}</Message.Header>
                                <Message.List items={f.warnings} />
                            </Message>
                        ))}
                    </>
                )}
            </div>
        );
    };

    const fileReader = useFileReader({
        existingStoryGroups: wipeCurrent ? [] : existingStoryGroups,
        defaultDomain,
        fallbackImportLanguage,
        projectLanguages: projectLanguages.map(l => l.value),
        instanceHost: instance.host,
        validateFunction,
    });
    const [fileList, setFileList] = fileReader;
    const [filesImporting, setFilesImporting] = useState(false);
    useEffect(() => {
        if (typeof setFileList === 'function') { setFileList({ wipe: fileList }); }
    }, [wipeCurrent]);
    const [{ canDrop, isOver }, drop] = useFileDrop(fileReader);
    const fileField = useRef();

    const renderImportSection = () => (
        <Segment
            className={`import-box ${
                canDrop && isOver && !filesImporting ? 'upload-target' : ''
            }`}
        >
            <div
                {...(!filesImporting ? { ref: drop } : {})}
                data-cy='drop-zone-data'
            >
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
                            onChange={e => handleFileDrop(e.target.files, fileReader)
                            }
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
                        <br />
                        <div className='side-by-side right'>
                            <Checkbox
                                toggle
                                checked={wipeCurrent}
                                onChange={() => setWipeCurrent(!wipeCurrent)}
                                label='Replace existing data'
                                data-cy='wipe-data'
                            />
                        </div>
                    </>
                )}
            </div>
        </Segment>
    );

    const valid = (filter = () => true) => fileList.filter(f => !f.errors && filter(f));

    const handleImport = () => handleImportAll(valid(), {
        projectId,
        fileReader,
        setImportingState: setFilesImporting,
        wipeCurrent,
        existingStoryGroups,
        existingSlots,
    });

    const renderTotals = () => {
        const checkUniques = () => {
            const duplicateSensitiveTypes = ['credentials', 'endpoints', 'rasaconfig', 'botfrontconfig'];
            const listOfFilesToCheck = fileList
                .map((file, index) => ({ dataType: file.dataType, index }))
                .filter(f => duplicateSensitiveTypes.includes(f.dataType));
           

            const duplicatesSummary = listOfFilesToCheck.reduce((duplicates, curr) => ({ ...duplicates, [curr.dataType]: [...duplicates[curr.dataType], curr.index] }), {
                credentials: [], endpoints: [], rasaconfig: [], botfrontconfig: [],
            });
        
            duplicateSensitiveTypes.forEach((fileType) => {
                if (duplicatesSummary[fileType].length > 1) {
                    const original = fileList[duplicatesSummary[fileType][0]].name;
                    const copies = duplicatesSummary[fileType].slice(1);
                    copies.forEach((copyIndex) => {
                        fileList[copyIndex] = { ...fileList[copyIndex], warnings: [`Duplicate of ${original}, and thus won't be used in the import`] };
                    });
                }
            });
        };
        checkUniques();

        const countAcrossFiles = (path, filter = () => true) => valid(filter).reduce(
            (acc, curr) => acc + _get(curr, path, []).length,
            0,
        );

        const numbers = {
            story: countAcrossFiles('parsedStories', f => f.dataType === 'stories'),
            slot: countAcrossFiles('slots', f => f.dataType === 'domain'),
            form: countAcrossFiles('bfForms', f => f.dataType === 'domain'),
            response: countAcrossFiles('responses', f => f.dataType === 'domain'),
        };
        projectLanguages.forEach((l) => {
            numbers[`${l.text} example`] = countAcrossFiles(
                'rasa_nlu_data.common_examples',
                f => f.dataType === 'nlu' && f.language === l.value,
            );
            numbers[`${l.text} synonym`] = countAcrossFiles(
                'rasa_nlu_data.entity_synonyms',
                f => f.dataType === 'nlu' && f.language === l.value,
            );
            numbers[`${l.text} gazette`] = countAcrossFiles(
                'rasa_nlu_data.gazette',
                f => f.dataType === 'nlu' && f.language === l.value,
            );
            numbers[`${l.text} regex feature`] = countAcrossFiles(
                'rasa_nlu_data.regex_features',
                f => f.dataType === 'nlu' && f.language === l.value,
            );
        });

        const pluralizeUnit = unit => (unit.slice(-1) === 'y' ? `${unit.slice(0, -1)}ies` : `${unit}s`);
        const printCount = (number, unit) => (number ? `${number} ${number < 2 ? unit : pluralizeUnit(unit)}` : null);
        return Object.keys(numbers)
            .map(n => printCount(numbers[n], n))
            .filter(c => c)
            .join(', ');
    };

    const counts = useMemo(renderTotals, fileReader);

    const renderBottom = () => {
        if (!counts) return null;
        return (
            <>
               
                <Message info>
                    <div>Importing {counts}.</div>
                    <div className='side-by-side middle'>
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
                                onChange={(_e, { value }) => {
                                    setFileList({ changeLang: value });
                                    setFallbackImportLanguage(value);
                                }}
                            />
                        </div>
                        <div>
                            <Button content='Import' data-cy='import-rasa-files' primary onClick={handleImport} />
                        </div>
                    </div>
                </Message>
            </>
        );
    };

    return (
        <>
            {renderImportSection()}
            {/* {renderBottom()} */}
        </>
    );
};

ImportRasaFiles.propTypes = {
    projectId: PropTypes.string.isRequired,
    existingStoryGroups: PropTypes.array.isRequired,
    existingSlots: PropTypes.array.isRequired,
    defaultDomain: PropTypes.object.isRequired,
};

ImportRasaFiles.defaultProps = {};

const ImportRasaFilesContainer = withTracker(({ projectId }) => {
    const storyGroupHandler = Meteor.subscribe('storiesGroup', projectId);
    const slotsHandler = Meteor.subscribe('slots', projectId);
    const existingStoryGroups = storyGroupHandler.ready()
        ? StoryGroups.find({ projectId }).fetch()
        : [];
    const existingSlots = slotsHandler.ready() ? Slots.find({ projectId }).fetch() : [];
    const { defaultDomain } = getDefaultDomainAndLanguage(projectId);
    return { existingStoryGroups, existingSlots, defaultDomain };
})(ImportRasaFiles);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(ImportRasaFilesContainer);
