import React, { useRef, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import {
    Button,
    Segment,
    Label,
    Icon,
    Message,
    Divider,
    Dimmer,
    Loader,
} from 'semantic-ui-react';
import { NativeTypes } from 'react-dnd-html5-backend-cjs';
import { useDrop } from 'react-dnd-cjs';
import { StoryGroups } from '../../../api/storyGroups/storyGroups.collection';
import { getDefaultDomainAndLanguage } from '../../../lib/story.utils';
import { useStoryFileReader, useDomainFileReader, useDatasetFileReader } from './fileReaders';
import { wrapMeteorCallback } from '../utils/Errors';
import { CREATE_AND_OVERWRITE_RESPONSES as createResponses } from '../templates/mutations';
import apolloClient from '../../../startup/client/apollo';
import { ProjectContext } from '../../layouts/context';

const ImportRasaFiles = (props) => {
    const {
        existingStoryGroups,
        projectId,
        fallbackImportLanguage,
        defaultDomain,
    } = props;
    const { projectLanguages, instance } = useContext(ProjectContext);

    const handleFileDrop = async (files, [fileList, setFileList]) => {
        const newValidFiles = Array.from(files).filter(
            f => f.size
                && !fileList.some(
                    // index on lastModified and filename
                    cf => cf.lastModified === f.lastModified && cf.filename === f.name,
                ),
        );
        setFileList({ add: newValidFiles });
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
            return {};
        };
        return (
            <>
                <div>
                    {fileList.map(f => (
                        <Label
                            key={`${f.filename}${f.lastModified}`}
                            {...colorOfLabel(f)}
                            as='a'
                        >
                            {f.name}
                            {f.name !== f.filename && (
                                <Label.Detail>({f.filename})</Label.Detail>
                            )}
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
                            <h4>
                                The following files cannot be parsed and will be ignored:
                            </h4>
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
                            <h4>
                                The following files have warnings associated with them:
                            </h4>
                            {filesWithWarnings.map(f => (
                                <Message color='yellow' key={`warnings-${f.name}`}>
                                    <Message.Header>{f.name}</Message.Header>
                                    <Message.List items={f.warnings} />
                                </Message>
                            ))}
                        </>
                    )}
                </div>
            </>
        );
    };

    const renderImportSection = (params) => {
        const {
            title,
            fileReader,
            canDrop,
            isOver,
            drop,
            fileField,
            onImport,
            importingState,
        } = params;
        const validFiles = fileReader[0].filter(f => !f.errors);
        const numberStories = validFiles.reduce(
            (acc, curr) => acc + (curr.parsedStories ? curr.parsedStories.length : 0),
            0,
        );
        return (
            <Segment
                className={`${
                    canDrop && isOver && !importingState ? 'upload-target' : ''
                }`}
                key={`import-${title}`}
            >
                <div
                    style={{ minHeight: '150px' }}
                    {...(!importingState ? { ref: drop } : {})}
                >
                    {importingState ? (
                        <Dimmer active inverted>
                            <Loader>{`Importing ${title}...`}</Loader>
                        </Dimmer>
                    ) : (
                        <>
                            <div className='side-by-side'>
                                <h3>
                                    {`Import ${title.replace(/^\w/, c => c.toUpperCase())}`}
                                </h3>
                                <div>
                                    <Button
                                        content={(
                                            <>
                                                <Icon name='add' /> Add file
                                            </>
                                        )}
                                        icon
                                        onClick={() => fileField.current.click()}
                                    />
                                    <Button
                                        icon
                                        disabled={!validFiles.length}
                                        content={(
                                            <>
                                                <Icon name='flag checkered' /> Import
                                                {numberStories
                                                    ? ` ${numberStories} stories`
                                                    : ''}
                                            </>
                                        )}
                                        onClick={() => onImport(validFiles)}
                                    />
                                </div>
                            </div>
                            <input
                                type='file'
                                ref={fileField}
                                style={{ display: 'none' }}
                                multiple
                                onChange={e => handleFileDrop(e.target.files, fileReader)
                                }
                            />
                            {renderFileList(fileReader)}
                        </>
                    )}
                </div>
            </Segment>
        );
    };

    const [storiesImporting, setStoriesImporting] = useState(false);
    const storyFileReader = useStoryFileReader(existingStoryGroups);
    const [dropStoryFilesIndicators, dropStoryFiles] = useFileDrop(storyFileReader);

    const handleImportStoryGroups = (files) => {
        setStoriesImporting(true);
        files.forEach(({
            _id, name, parsedStories, filename, lastModified,
        }, idx) => {
            const callback = (error) => {
                if (!error) storyFileReader[1]({ delete: { filename, lastModified } });
                if (error || idx === files.length - 1) setStoriesImporting(false);
            };
            Meteor.call(
                'storyGroups.insert',
                { _id, name, projectId },
                wrapMeteorCallback((err) => {
                    if (!parsedStories.length || err) return callback(err);
                    return Meteor.call(
                        'stories.insert',
                        parsedStories.map(s => ({ ...s, projectId })),
                        wrapMeteorCallback(callback),
                    );
                }),
            );
        });
    };

    const [domainImporting, setDomainImporting] = useState(false);
    const domainFileReader = useDomainFileReader({
        defaultDomain,
        fallbackImportLanguage,
        projectLanguages: projectLanguages.map(l => l.value),
    });
    const [dropDomainFilesIndicators, dropDomainFiles] = useFileDrop(domainFileReader);

    const handleImportDomain = (files) => {
        setDomainImporting(true);
        files.forEach(({
            slots, templates, filename, lastModified,
        }, idx) => {
            const callback = (error) => {
                if (!error) domainFileReader[1]({ delete: { filename, lastModified } });
                if (error || idx === files.length - 1) setDomainImporting(false);
            };
            Meteor.call(
                'slots.upsert',
                slots,
                projectId,
                wrapMeteorCallback((err) => {
                    if (err) return callback(err);
                    return apolloClient
                        .mutate({
                            mutation: createResponses,
                            variables: { projectId, responses: templates },
                        })
                        .then((res) => {
                            if (!res || !res.data) {
                                return wrapMeteorCallback(callback)({
                                    message: 'Templates not inserted',
                                });
                            }
                            const notUpserted = templates.filter(
                                ({ key }) => !res.data.createAndOverwriteResponses
                                    .map(d => d.key)
                                    .includes(key),
                            );
                            if (notUpserted.length) {
                                wrapMeteorCallback(callback)({
                                    message: `Templates ${notUpserted.join(
                                        ', ',
                                    )} not inserted.`,
                                });
                            }
                            return callback();
                        });
                }),
            );
        });
    };

    const [datasetImporting, setDatasetImporting] = useState(false);
    const datasetFileReader = useDatasetFileReader({
        instanceHost: instance.host,
        fallbackImportLanguage,
        projectLanguages: projectLanguages.map(l => l.value),
    });
    const [dropDatasetFilesIndicators, dropDatasetFiles] = useFileDrop(datasetFileReader);

    const handleImportDataset = (files) => {
        setDatasetImporting(true);
        files.forEach((f, idx) => {
            Meteor.call('nlu.import', f.rasa_nlu_data, projectId, f.language, false, wrapMeteorCallback((err) => {
                if (!err) datasetFileReader[1]({ delete: { filename: f.filename, lastModified: f.lastModified } });
                if (err || idx === files.length - 1) setDatasetImporting(false);
            }));
        });
    };

    const importers = [
        {
            title: 'stories',
            fileReader: storyFileReader,
            ...dropStoryFilesIndicators,
            drop: dropStoryFiles,
            fileField: useRef(),
            onImport: handleImportStoryGroups,
            importingState: storiesImporting,
        },
        {
            title: 'domain',
            fileReader: domainFileReader,
            ...dropDomainFilesIndicators,
            drop: dropDomainFiles,
            fileField: useRef(),
            onImport: handleImportDomain,
            importingState: domainImporting,
        },
        {
            title: 'NLU data',
            fileReader: datasetFileReader,
            ...dropDatasetFilesIndicators,
            drop: dropDatasetFiles,
            fileField: useRef(),
            onImport: handleImportDataset,
            importingState: datasetImporting,
        },
    ];

    return importers.map(renderImportSection);
};

ImportRasaFiles.propTypes = {
    existingStoryGroups: PropTypes.array.isRequired,
    fallbackImportLanguage: PropTypes.string.isRequired,
    defaultDomain: PropTypes.object.isRequired,
};

ImportRasaFiles.defaultProps = {};

const ImportRasaFilesContainer = withTracker(({ projectId }) => {
    const storyGroupHandler = Meteor.subscribe('storiesGroup', projectId);
    const existingStoryGroups = storyGroupHandler.ready()
        ? StoryGroups.find({ projectId }).fetch()
        : [];
    const { defaultDomain } = getDefaultDomainAndLanguage(projectId);
    return { existingStoryGroups, defaultDomain };
})(ImportRasaFiles);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(ImportRasaFilesContainer);
