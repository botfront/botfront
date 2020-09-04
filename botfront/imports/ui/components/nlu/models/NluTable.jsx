import React, {
    useEffect, useState, useRef, useContext,
} from 'react';
import {
    Popup, Grid, Checkbox, Icon, Confirm,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import DataTable from '../../common/DataTable';
import { _appendSynonymsToText } from '../../../../lib/filterExamples';
import 'react-s-alert/dist/s-alert-default.css';
import Filters from './Filters';
import { ProjectContext } from '../../../layouts/context';
import NluCommandBar from './NluCommandBar';
import { useEventListener } from '../../utils/hooks';

function NluTable(props) {
    const {
        entitySynonyms,
        loadingExamples,
        data,
        updateExamples,
        deleteExamples,
        loadMore,
        hasNextPage,
        hideFilters,
        updateFilters,
        filters,
        columns,
        singleSelectedIntentLabelRef,
        selection,
        setSelection,
        useShortCuts,
        noDrafts,
        height,
    } = props;
    const { intents, entities } = useContext(ProjectContext);

    const tableRef = useRef(null);
    const nluCommandBarRef = useRef(null);
    const [confirm, setConfirm] = useState(null);
    
    
    const [examples, setExamples] = useState([]);

    function multipleDelete(ids) {
        const message = `Delete ${ids.length} NLU examples?`;
        const action = () => deleteExamples(ids);
        setConfirm({ message, action });
    }

    function multipleUndraft(ids) {
        const message = `Remove draft status of  ${ids.length} NLU examples`;
        const examplesToUpdate = ids.map(_id => ({ _id, metadata: { draft: false } }));
        const action = () => updateExamples(examplesToUpdate);
        setConfirm({ message, action });
    }

    function multipleSetIntent(ids, intent) {
        const message = `Change intent to ${intent} for ${ids.length} NLU examples?`;
        const examplesToUpdate = ids.map(_id => ({ _id, intent }));
        const action = () => updateExamples(examplesToUpdate);
        setConfirm({ message, action });
    }

    const handleOpenIntentSetterDialogue = () => {
        if (!selection.length) return null;
        if (selection.length === 1) return singleSelectedIntentLabelRef.current.openPopup();
        return nluCommandBarRef.current.openIntentPopup();
    };
    useEventListener('keydown', (e) => {
        if (!useShortCuts) return;
        const {
            key, shiftKey, metaKey, ctrlKey, altKey,
        } = e;
        if (shiftKey || metaKey || ctrlKey || altKey) return;
        if (!!confirm) {
            if (key.toLowerCase() === 'n') setConfirm(null);
            if (key.toLowerCase() === 'y' || key === 'Enter') { confirm.action(); setConfirm(null); }
            return;
        }
        
        if (e.target !== tableRef.current.tableRef().current) return;
        if (selection.length === 0 && key.toLowerCase() === 'c') {
            updateFilters({ ...filters, onlyCanonicals: !filters.onlyCanonicals });
        }
        if (key === 'Escape') setSelection([]);
        if (key.toLowerCase() === 'd') multipleDelete(selection);
        if (key.toLowerCase() === 'u' && !noDrafts) multipleUndraft(selection);
        
        if (key.toLowerCase() === 'i') {
            e.stopPropagation();
            e.preventDefault();
            handleOpenIntentSetterDialogue(e);
        }
    });
   

    const getExamplesWithExtraSynonyms = (examplesList) => {
        if (!examplesList) return [];
        return examplesList.map(e => _appendSynonymsToText(e, entitySynonyms));
    };
    useEffect(() => {
        if (!loadingExamples) setExamples(getExamplesWithExtraSynonyms(data));
    }, [data]);
    

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
                        tableRef.current.tableRef().current.focus();
                    }}
                    onConfirm={() => { confirm.action(); setConfirm(null); tableRef.current.tableRef().current.focus(); }}
                />
            )}
            {!hideFilters && (
                <Grid style={{ paddingBottom: '12px' }}>
                    <Grid.Row>
                        <Grid.Column width={13} textAlign='left' verticalAlign='middle'>
                            <Filters
                                intents={intents}
                                entities={entities}
                                filter={filters}
                                onChange={newFilters => updateFilters(newFilters)}
                            />
                                
                        </Grid.Column>

                          
                        <Grid.Column width={3} textAlign='right' verticalAlign='middle'>
                            <Checkbox
                                onChange={() => updateFilters({ ...filters, onlyCanonicals: !filters.onlyCanonicals })
                                }
                                hidden={false}
                                slider
                                checked={filters.onlyCanonicals}
                                data-cy='only-canonical'
                                readOnly={false}
                                className='only-canonical'
                            />
                            <Popup
                                trigger={
                                    <Icon name='gem' color={filters.onlyCanonicals ? 'black' : 'grey'} />
                                }
                                content='Only show canonicals examples'
                                position='top center'
                                inverted
                            />
                            
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            )}
            <DataTable
                ref={tableRef}
                columns={columns}
                data={examples}
                hasNextPage={hasNextPage}
                loadMore={loadingExamples ? () => { } : loadMore}
                rowClassName='glow-box hoverable'
                className='new-utterances-table'
                selection={selection}
                height={height}
                onChangeSelection={(newSelection) => {
                    setSelection(newSelection);
                }}
            />
            {selection.length > 1 && useShortCuts && (
                <NluCommandBar
                    ref={nluCommandBarRef}
                    selection={selection}
                    onSetIntent={multipleSetIntent}
                    onDelete={multipleDelete}
                    onUndraft={noDrafts ? undefined : multipleUndraft}
                    onCloseIntentPopup={() => tableRef.current.tableRef().current.focus()}
                    
                />
            )}
        </>
    );
    return renderDataTable();
}


NluTable.propTypes = {
    entitySynonyms: PropTypes.array,
    loadingExamples: PropTypes.bool,
    data: PropTypes.array.isRequired,
    updateExamples: PropTypes.func,
    deleteExamples: PropTypes.func,
    loadMore: PropTypes.func,
    hasNextPage: PropTypes.bool,
    hideFilters: PropTypes.bool,
    updateFilters: PropTypes.func,
    filters: PropTypes.object,
    columns: PropTypes.array.isRequired,
    singleSelectedIntentLabelRef: PropTypes.object,
    selection: PropTypes.array.isRequired,
    setSelection: PropTypes.func.isRequired,
    useShortCuts: PropTypes.bool,
    hideDraft: PropTypes.bool,
};

NluTable.defaultProps = {
    entitySynonyms: [],
    loadingExamples: false,
    updateExamples: () => {},
    deleteExamples: () => {},
    loadMore: () => {},
    hasNextPage: false,
    hideFilters: false,
    updateFilters: () => {},
    filters: {},
    singleSelectedIntentLabelRef: {},
    useShortCuts: false,
};
export default NluTable;
