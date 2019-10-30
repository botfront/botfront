import React from 'react';
import PropTypes from 'prop-types';
import {
    Checkbox, Tab, Grid, Loader, Popup,
} from 'semantic-ui-react';
import Alert from 'react-s-alert';
import 'react-s-alert/dist/s-alert-default.css';
import _, { difference } from 'lodash';
import ReactTable from 'react-table';
import matchSorter from 'match-sorter';
import Intent from '../../utils/IntentLabel';
import Entity from '../../utils/EntityLabel';
import { _cleanQuery, includeSynonyms } from '../../../../lib/filterExamples';
import NLUExampleEditMode from '../../example_editor/NLUExampleEditMode';
import NLUExampleText from '../../example_editor/NLUExampleText';
import EntityUtils from '../../utils/EntityUtils';
import IntentNameEditor from './IntentViewer';
import 'react-select/dist/react-select.css'; // Is it used somewhere?
import Filters from './Filters';
import FloatingIconButton from '../common/FloatingIconButton';

export default class NluDataTable extends React.Component {
    constructor(props) {
        super(props);
        const { showLabels } = this.props;
        this.state = {
            waiting: new Set(),
            filter: {
                intents: [],
                entities: [],
            },
            showLabels,
            onlyCanonical: false,
        };
    }

    onEditExample = (example, callback) => {
        const { onEditExample } = this.props;
        onEditExample(example, (err, res) => {
            callback(err, res);
            if (!err) {
                this.setState({ expanded: {} });
            }
        });
    };

    onEditEntityValue(example, entity, value) {
        const { onEditExample } = this.props;
        const newExample = EntityUtils.getUpdatedExample(example, entity, { entity: value });
        onEditExample(newExample);
    }

    getIntentForDropdown(all) {
        const intentSelection = all ? [{ text: 'ALL', value: null }] : [];
        const { intents } = this.props;
        intents.forEach((i) => {
            intentSelection.push({
                text: i,
                value: i,
            });
        });
        return intentSelection;
    }

    getExamples = () => {
        const { examples } = this.props;
        const filter = this.scrapFilter();
        const { entities, intents, query } = filter;
        let filtered = examples.filter((e) => {
            if (!e.entities) e.entities = [];
            const intentOk = intents.length === 0 || difference([e.intent], intents).length === 0;
            const entitiesOk = !!e.entities
                && difference(entities, e.entities.map(ent => ent.entity)).length === 0;
            const canonicalOk = this.state.onlyCanonical ? e.canonical : true;
            return intentOk && entitiesOk && canonicalOk;
        });
        if (query) {
            let matchCriteria = { keys: ['text', 'intent'] };
            if (includeSynonyms(query)) matchCriteria = { keys: ['text', 'intent', 'extra'] };
            filtered = matchSorter(filtered, _cleanQuery(query), matchCriteria);
        }
        return filtered;
    };

    getColumns() {
        const {
            onRenameIntent, examples, projectId, entities, extraColumns, onDeleteExample, onSwitchCanonical,
        } = this.props;
        let { intentColumns } = this.props;
        const { showLabels, waiting } = this.state;
        intentColumns = intentColumns || [
            {
                accessor: 'intent',
                Header: 'Intent',
                width: 200,
                filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: ['intent'] }),
                Cell: props => (
                    <IntentNameEditor
                        intent={props.value}
                        onRenameIntent={onRenameIntent}
                        examples={examples}
                        intents={this.getIntentForDropdown(false)}
                        onSave={this.onEditExample}
                        example={props.original}
                        enableRenaming
                        projectId={projectId}
                    />
                ),
            },
        ];

        let firstColumns = [
            {
                accessor: 'text',
                Header: 'text',
                show: false,
            },
            {
                id: 'example',
                sortMethod: (a, b) => a.text.localeCompare(b.text),
                sortable: true,
                accessor: e => e,
                Header: 'Example',
                Cell: props => (
                    <NLUExampleText
                        example={props.value}
                        entities={entities}
                        showLabels={showLabels}
                        onSave={this.onEditExample}
                        editable
                    />
                ),
                style: { overflow: 'visible' },
            },
        ];

        firstColumns = intentColumns.concat(firstColumns.concat(extraColumns || []));

        firstColumns.push({
            accessor: '_id',
            filterable: false,
            Cell: (props) => {
                if (waiting.has(props.row.example._id)) {
                    return (<Loader active inline size='mini' />);
                }
                const canonical = props.row.example.canonical ? props.row.example.canonical : false;
                let toolTip = (<div>Mark as canonical</div>);
                if (canonical) {
                    toolTip = (<><Popup.Header>Canonical Example</Popup.Header>
                        <Popup.Content style={{ textAlign: 'left' }}>
                            This example is canonical for the intent
                            <Intent size='mini' value={props.row.example.intent} />
                            {props.row.example.entities && props.row.example.entities.length > 0
                                ? (<>and for the following entity - entity value combinations: <br />
                                    {props.row.example.entities.map(entity => (<Entity value={entity} onChange={() => { }} />))}</>)
                                : ''}

                        </Popup.Content></>);
                }

                return (

                    <FloatingIconButton
                        toolTip={toolTip}
                        toolTipInverted={!canonical}
                        icon='gem'
                        color={canonical ? 'black' : undefined}
                        onClick={async () => {
                            // need to recreate a set since state do not detect update through mutations
                            this.setState({ waiting: new Set(waiting.add(props.row.example._id)) });
                            const result = await onSwitchCanonical(props.row.example);
                            if (result.change) {
                                Alert.warning(`The previous canonical example with the same intent 
                                and entity - entity value combination 
                                (if applicable) with this example has been unmarked canonical`, {
                                    position: 'top-right',
                                    timeout: 5000,
                                });
                            }
                            waiting.delete(props.row.example._id);
                            this.setState({ waiting: new Set(waiting) });
                        }}
                        iconClass={canonical ? '' : undefined} // remove the on hover class if canonical
                    />);
            },
            Header: '',
            width: 30,
        });
        firstColumns.push({
            accessor: '_id',
            filterable: false,
            Cell: (props) => {
                const canonical = props.row.example.canonical ? props.row.example.canonical : false;
                return (
                    <FloatingIconButton
                        toolTip={canonical ? <>Cannot delete a canonical example</> : null}
                        toolTipInverted={!canonical}
                        disabled={canonical}
                        icon='trash'
                        onClick={() => onDeleteExample(props.value)}
                        iconClass={canonical ? 'disabled-delete' : undefined}
                    />
                );
            },
            Header: '',
            width: 30,
        });

        return firstColumns;
    }

    collapseExpanded = () => this.setState({ expanded: {} });

    scrapFilter() {
        const { filter: { intents: intentsFilter, entities: entitiesFilter, query } } = this.state;
        const { intents, entities } = this.props;

        return {
            intents: intentsFilter.filter(intent => _.includes(intents, intent)),
            entities: entitiesFilter.filter(entity => _.includes(entities, entity)),
            query,
        };
    }

    render() {
        const headerStyle = { textAlign: 'left', fontWeight: 800, paddingBottom: '10px' };
        const columns = this.getColumns();
        const { hideHeader, intents, entities } = this.props;
        const { showLabels, expanded } = this.state;
        return (
            <Tab.Pane as='div'>
                {!hideHeader && (
                    <Grid style={{ paddingBottom: '12px' }}>
                        <Grid.Row>
                            <Grid.Column width={13} textAlign='left' verticalAlign='middle'>
                                <Filters
                                    intents={intents}
                                    entities={entities}
                                    filter={this.scrapFilter()}
                                    onChange={filter => this.setState({ filter })}
                                />
                            </Grid.Column>
                            <Grid.Column width={3} textAlign='right' verticalAlign='middle'>
                                <Checkbox
                                    onChange={() => this.setState({
                                        onlyCanonical: !this.state.onlyCanonical,
                                    })
                                    }
                                    slider
                                    label='Only show canonical'
                                    data-cy='only-canonical'
                                    readOnly={false}

                                />
                            </Grid.Column>
                            <Grid.Column width={3} textAlign='right' verticalAlign='middle'>
                                {entities.length > 0
                                    && showLabels === undefined && (
                                        <Checkbox
                                            checked={showLabels}
                                            onChange={() => this.setState({
                                                showLabels: !showLabels,
                                            })
                                            }
                                            slider
                                            label='Entity names'
                                            style={{ marginBottom: '10px' }}
                                            data-cy='trigger-entity-names'
                                        />
                                    )}
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                )}
                <ReactTable
                    data={this.getExamples()}
                    onFilteredChange={this.collapseExpanded}
                    onSortedChange={this.collapseExpanded}
                    onPageChange={() => this.setState({ expanded: {} })}
                    expanded={expanded}
                    onExpandedChange={(newExpanded, index) => {
                        let expandedChange = {};
                        if (newExpanded[index[0]] === false) {
                            expandedChange = {};
                        } else {
                            Object.keys(newExpanded).forEach((k) => {
                                expandedChange[k] = parseInt(k, 10) === index[0] ? {} : false;
                            });
                        }
                        this.setState({ expanded: expandedChange });
                    }}
                    columns={columns}
                    minRows={1}
                    style={{ overflow: 'visible' }}
                    getTbodyProps={() => ({
                        style: {
                            overflow: 'visible',
                        },
                    })}
                    getTableProps={() => ({
                        style: {
                            overflow: 'visible',
                        },
                    })}
                    getTdProps={() => ({
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                        },
                    })}
                    getTheadThProps={() => ({
                        style: {
                            borderRight: 'none',
                            ...headerStyle,
                        },
                    })}
                    className=''
                    SubComponent={row => (
                        <NLUExampleEditMode
                            floated='right'
                            example={row.original}
                            entities={entities}
                            intents={this.getIntentForDropdown(false)}
                            onSave={this.onEditExample}
                            onCancel={() => this.setState({ expanded: {} })}
                            postSaveAction='close'
                        />
                    )}
                />
            </Tab.Pane>
        );
    }
}

NluDataTable.propTypes = {
    examples: PropTypes.array.isRequired,
    intents: PropTypes.array.isRequired,
    entities: PropTypes.array.isRequired,
    onEditExample: PropTypes.func.isRequired,
    onDeleteExample: PropTypes.func.isRequired,
    onRenameIntent: PropTypes.func.isRequired,
    showLabels: PropTypes.bool,
    hideHeader: PropTypes.bool,
    extraColumns: PropTypes.array,
    intentColumns: PropTypes.arrayOf(PropTypes.object),
    projectId: PropTypes.string.isRequired,
};

NluDataTable.defaultProps = {
    showLabels: true,
    hideHeader: false,
    extraColumns: [],
    intentColumns: null,
};
