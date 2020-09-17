import React, {
    useState, useRef, useContext, useMemo, useImperativeHandle,
} from 'react';
import {
    Popup, Checkbox, Icon, Confirm, Button,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import DataTable from '../../common/DataTable';
import 'react-s-alert/dist/s-alert-default.css';
import Filters from './Filters';
import { ProjectContext } from '../../../layouts/context';
import NluCommandBar from './NluCommandBar';
import IconButton from '../../common/IconButton';
import UserUtteranceViewer from '../common/UserUtteranceViewer';
import { ExampleTextEditor } from '../../example_editor/ExampleTextEditor';
import IntentLabel from '../common/IntentLabel';
import { useEventListener } from '../../utils/hooks';
import getColor from '../../../../lib/getColors';
import { clearTypenameField } from '../../../../lib/client.safe.utils';

const NluTable = React.forwardRef((props, forwardedRef) => {
    const {
        loadingExamples,
        data,
        updateExamples,
        deleteExamples,
        loadMore,
        hasNextPage,
        updateFilters,
        filters,
        selection,
        setSelection,
        noDrafts,
        renderLabelColumn: renderExternalLabelColumn,
        switchCanonical,
        additionalIntentOption,
    } = props;

    const { intents, entities } = useContext(ProjectContext);
    const [editExampleId, setEditExampleId] = useState([]);

    const tableRef = useRef(null);
    const nluCommandBarRef = useRef(null);
    const [confirm, setConfirm] = useState(null);
    const singleSelectedIntentLabelRef = useRef(null);

    const handleEditExample = example => updateExamples([clearTypenameField(example)]);

    useImperativeHandle(forwardedRef, () => ({
        scrollToItem: tableRef?.current?.scrollToItem,
    }));

    const resetEditExample = () => {
        setEditExampleId(null);
        return tableRef?.current?.focusTable();
    };

    const handleExampleTextSave = (example) => {
        if ( // no text or text didn't change
            !example.text.trim()
            || example.text === (data.find(({ _id }) => _id === example._id) || {}).text
        ) { return resetEditExample(); }
        return Promise.resolve(handleEditExample(example)).then(resetEditExample);
    };

    const canonicalTooltip = (jsx, canonical) => {
        if (!canonical) return jsx;
        return (
            <Popup
                trigger={<div>{jsx}</div>}
                inverted
                postion='left'
                content={(
                    <>
                        Remove canonical &#x27E8;
                        <Icon name='gem' style={{ margin: 0 }} />
                        &#x27E9; status to edit
                    </>
                )}
            />
        );
    };

    const renderIntentLabel = (row) => {
        const { datum } = row;
        const { metadata: { canonical = false } = {}, intent, deleted } = datum;
        return canonicalTooltip(
            <IntentLabel
                {...(selection.length === 1 && datum._id === selection[0]
                    ? { ref: singleSelectedIntentLabelRef }
                    : {})}
                value={intent}
                allowEditing={!canonical && !deleted}
                allowAdditions
                onChange={i => handleEditExample({ ...datum, intent: i })}
                onClose={() => tableRef?.current?.focusTable()}
                additionalIntentOption={additionalIntentOption}
            />,
            canonical,
        );
    };

    const selectionWithFullData = useMemo(
        () => data.filter(({ _id }) => selection.includes(_id)),
        [selection, data],
    );

    const renderExample = (row) => {
        const { datum } = row;
        const { metadata: { canonical = false } = {}, _id, deleted } = datum;

        if (editExampleId === _id) {
            return (
                <ExampleTextEditor
                    example={datum}
                    onCancel={resetEditExample}
                    onSave={handleExampleTextSave}
                />
            );
        }
        return canonicalTooltip(
            <UserUtteranceViewer
                value={datum}
                onChange={handleEditExample}
                projectId=''
                disableEditing={canonical || deleted}
                showIntent={false}
            />,
            canonical,
        );
    };

    const renderLabelColumn = (row, ...args) => {
        if (renderExternalLabelColumn) return renderExternalLabelColumn(row, ...args);
        const { datum } = row;
        const { metadata: { draft = false } = {}, intent } = datum;
        if (!draft) return null;
        return (
            <Button
                size='mini'
                disabled={!intent}
                className='persistent draft-save-button'
                compact
                onClick={() => handleEditExample({
                    ...datum,
                    metadata: { ...datum.metadata, draft: false },
                })
                }
                onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
            />
        );
    };

    const renderActionsColumn = (row) => {
        const { datum } = row;
        const {
            intent,
            metadata: { canonical = false, draft = false } = {},
            _id,
            invalid,
            deleted,
        } = datum;
        let tooltip = <div>Mark as canonical</div>;
        if (canonical) {
            tooltip = (
                <>
                    <Popup.Header>Canonical Example</Popup.Header>
                    <Popup.Content className='popup-canonical'>
                        This example is canonical for the intent
                        <span className='intent-name'> {datum.intent}</span>
                        {datum.entities && datum.entities.length > 0 ? (
                            <>
                                &nbsp; and for the following entity - entity value
                                combinations: <br />
                                {datum.entities.map(entity => (
                                    <span>
                                        <strong
                                            style={{
                                                color: getColor(entity.entity)
                                                    .backgroundColor,
                                            }}
                                        >
                                            {entity.entity}
                                        </strong>
                                        : {entity.value}
                                    </span>
                                ))}
                            </>
                        ) : (
                            ''
                        )}
                    </Popup.Content>
                </>
            );
        }
        return (
            <div className='side-by-side narrow right'>
                {!canonical && !deleted && (
                    <IconButton
                        active={canonical}
                        icon='edit'
                        size='small'
                        onClick={() => setEditExampleId(_id)}
                    />
                )}
                {!canonical && (
                    <IconButton
                        icon='trash'
                        size='small'
                        onClick={() => deleteExamples([datum._id])}
                    />
                )}
                {!draft && intent && !deleted && !invalid && (
                    <Popup
                        position='top center'
                        disabled={tooltip === null}
                        trigger={(
                            <div>
                                <IconButton
                                    color={canonical ? 'black' : 'grey'}
                                    className={canonical ? 'persistent' : undefined}
                                    basic={canonical}
                                    icon='gem'
                                    size='small'
                                    disabled={tooltip === null}
                                    onClick={() => switchCanonical(datum)}
                                    data-cy='icon-gem'
                                />
                            </div>
                        )}
                        inverted={!canonical}
                        content={tooltip}
                    />
                )}
            </div>
        );
    };

    const columns = [
        { key: '_id', selectionKey: true, hidden: true },
        {
            key: 'intent',
            style: {
                paddingLeft: '1rem',
                width: '200px',
                minWidth: '200px',
                overflow: 'hidden',
            },
            render: renderIntentLabel,
        },
        {
            key: 'text',
            style: { width: '100%' },
            render: renderExample,
        },
        { key: 'labelColumn', style: { width: '50px' }, render: renderLabelColumn },
        {
            key: 'actions',
            style: { width: '200px' },
            render: renderActionsColumn,
        },
    ];

    const getFallbackUtterance = (ids) => {
        const bounds = [ids[0], ids[ids.length - 1]].map(id1 => data.findIndex(d => d._id === id1));
        return data[bounds[1] + 1]
            ? data[bounds[1] + 1]
            : data[Math.max(0, bounds[0] - 1)];
    };

    const mutationCallback = (fallbackUtterance, mutationName) => ({
        data: { [mutationName]: res = [] } = {},
    }) => {
        const filtered = selection.filter(s => !res.includes(s));
        return setSelection(
            // remove deleted from selection
            filtered.length ? filtered : [fallbackUtterance._id],
        );
    };

    function handleDelete(ids) {
        if (selectionWithFullData.some(d => d.metadata?.canonical)) return null;
        const someOriginallyNotDeleted = selectionWithFullData.some(
            ({ deleted }) => !deleted,
        );
        const verb = someOriginallyNotDeleted ? 'Delete' : 'Undelete';
        const fallbackUtterance = getFallbackUtterance(ids);
        const message = `${verb} ${ids.length} NLU examples?`;
        const action = () => deleteExamples(ids).then(
            mutationCallback(fallbackUtterance, 'deleteExamples'),
        );
        return ids.length > 1 ? setConfirm({ message, action }) : action();
    }

    function handleUndraft(ids) {
        if (selectionWithFullData.some(d => !d.intent || !d?.metadata?.draft)) {
            return null;
        }
        const message = `Remove draft status of  ${ids.length} NLU examples`;
        const examplesToUpdate = ids.map(_id => ({ _id, metadata: { draft: false } }));
        const action = () => updateExamples(examplesToUpdate);
        return ids.length > 1 ? setConfirm({ message, action }) : action();
    }

    function handleSetIntent(ids, intent) {
        const message = `Change intent to ${intent} for ${ids.length} NLU examples?`;
        const examplesToUpdate = ids.map(_id => ({ _id, intent }));
        const action = () => updateExamples(examplesToUpdate);
        return ids.length > 1 ? setConfirm({ message, action }) : action();
    }

    const handleOpenIntentSetterDialogue = () => {
        if (!selection.length) return null;
        if (selection.length === 1) {
            return singleSelectedIntentLabelRef.current.openPopup();
        }
        return nluCommandBarRef.current.openIntentPopup();
    };

    useEventListener('keydown', (e) => {
        const {
            key, shiftKey, metaKey, ctrlKey, altKey,
        } = e;
        if (shiftKey || metaKey || ctrlKey || altKey) return;
        if (!!confirm) {
            if (key.toLowerCase() === 'n') setConfirm(null);
            if (key.toLowerCase() === 'y' || key === 'Enter') {
                confirm.action();
                setConfirm(null);
            }
            return;
        }
        if (e.target !== tableRef?.current?.actualTable()) return;
        if (selection.length === 0 && key.toLowerCase() === 'c' && filters) {
            updateFilters({ ...filters, onlyCanonicals: !filters.onlyCanonicals });
        }
        if (key === 'Escape') setSelection([]);
        if (key.toLowerCase() === 'd') handleDelete(selection);
        if (key.toLowerCase() === 'e') {
            if (selection.length !== 1) return;
            const { metadata, deleted, _id } = selectionWithFullData[0];
            if (metadata?.canonical || deleted) return;
            e.preventDefault();
            setEditExampleId(_id);
        }
        if (key.toLowerCase() === 's' && !noDrafts) handleUndraft(selection);
        if (key.toLowerCase() === 'i') {
            e.stopPropagation();
            e.preventDefault();
            handleOpenIntentSetterDialogue(e);
        }
    });

    const rowClassName = (datum) => {
        if (datum?.metadata?.draft && !noDrafts) return 'yellow';
        if (datum?.deleted) return 'grey';
        if (datum?.invalid) return 'red';
        if (datum?.isNew) return 'yellow';
        if (datum?.edited) return 'olive';
        return '';
    };

    const renderDataTable = () => (
        <>
            {!!confirm && (
                <Confirm
                    open
                    className='with-shortcuts'
                    cancelButton='No'
                    confirmButton='Yes'
                    content={confirm.message}
                    onCancel={() => {
                        setConfirm(null);
                        return tableRef?.current?.focusTable();
                    }}
                    onConfirm={() => {
                        confirm.action();
                        setConfirm(null);
                        return tableRef?.current?.focusTable();
                    }}
                />
            )}
            {filters && (
                <div className='side-by-side middle'>
                    <Filters
                        intents={intents}
                        entities={entities}
                        filter={filters}
                        onChange={newFilters => updateFilters({ ...filters, ...newFilters })
                        }
                        className='left wrap'
                    />
                    <Checkbox
                        onChange={() => updateFilters({
                            ...filters,
                            onlyCanonicals: !filters.onlyCanonicals,
                        })
                        }
                        hidden={false}
                        slider
                        checked={filters.onlyCanonicals}
                        data-cy='only-canonical'
                        readOnly={false}
                        className='only-canonical'
                    />
                    <Popup
                        trigger={(
                            <Icon
                                name='gem'
                                color={filters.onlyCanonicals ? 'black' : 'grey'}
                            />
                        )}
                        content='Only show canonicals examples'
                        position='top center'
                        inverted
                    />
                </div>
            )}
            <DataTable
                ref={tableRef}
                bufferSize={20}
                columns={columns}
                data={data}
                hasNextPage={hasNextPage}
                loadMore={loadingExamples ? () => {} : loadMore}
                selection={selection}
                onChangeSelection={newSelection => setSelection(newSelection)}
                rowClassName={rowClassName}
            />
            {selection.length > 1 && (
                <NluCommandBar
                    ref={nluCommandBarRef}
                    selection={selectionWithFullData}
                    onSetIntent={handleSetIntent}
                    onDelete={handleDelete}
                    onUndraft={noDrafts ? undefined : handleUndraft}
                    onCloseIntentPopup={() => tableRef?.current?.focusTable()}
                />
            )}
        </>
    );
    return renderDataTable();
});

NluTable.propTypes = {
    loadingExamples: PropTypes.bool,
    data: PropTypes.array.isRequired,
    updateExamples: PropTypes.func,
    deleteExamples: PropTypes.func,
    switchCanonical: PropTypes.func,
    loadMore: PropTypes.func,
    hasNextPage: PropTypes.bool,
    updateFilters: PropTypes.func,
    filters: PropTypes.object,
    selection: PropTypes.array.isRequired,
    setSelection: PropTypes.func.isRequired,
    noDrafts: PropTypes.bool,
    renderLabelColumn: PropTypes.func,
    additionalIntentOption: PropTypes.string,
};

NluTable.defaultProps = {
    loadingExamples: false,
    updateExamples: () => {},
    deleteExamples: () => {},
    switchCanonical: () => {},
    loadMore: () => {},
    hasNextPage: false,
    updateFilters: () => {},
    filters: null,
    noDrafts: false,
    renderLabelColumn: null,
    additionalIntentOption: '',
};
export default NluTable;
