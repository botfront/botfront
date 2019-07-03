import React from 'react';
import PropTypes from 'prop-types';
import {
    Checkbox, Tab, Grid,
} from 'semantic-ui-react';
import _, { difference } from 'lodash';
import ReactTable from 'react-table';
import matchSorter from 'match-sorter';

import { _cleanQuery, includeSynonyms } from '../../../../lib/filterExamples';
import NLUExampleEditMode from '../../example_editor/NLUExampleEditMode';
import NLUExampleText from '../../example_editor/NLUExampleText';
import EntityUtils from '../../utils/EntityUtils';
import IntentNameEditor from './IntentViewer';
import 'react-select/dist/react-select.css'; // Is it used somewhere?
import Filters from './Filters';
import { can } from '../../../../lib/scopes';
import TrashBin from '../common/TrashBin';

export default class NluDataTable extends React.Component {
    constructor(props) {
        super(props);
        const { showLabels } = this.props;
        this.state = {
            expanded: {},
            filter: {
                intents: [],
                entities: [],
            },
            showLabels,
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
            return intentOk && entitiesOk;
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
            onRenameIntent, examples, projectId, entities, extraColumns, onDeleteExample,
        } = this.props;
        let { intentColumns } = this.props;
        const { showLabels } = this.state;
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
                        enableRenaming={can('nlu-data:w', projectId)}
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
                        projectId={projectId}
                    />
                ),
                style: { overflow: 'visible' },
            },
        ];

        firstColumns = intentColumns.concat(firstColumns.concat(extraColumns || []));

        if (can('nlu-data:w', projectId)) {
            firstColumns.push({
                accessor: '_id',
                filterable: false,
                Cell: props => (
                    <TrashBin
                        onClick={() => onDeleteExample(props.value)}
                    />
                ),
                Header: '',
                width: 30,
            });
        }

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

    renderSubComponent(row) {
        const { projectId, entities } = this.props;
        if (can('nlu-data:w', projectId)) {
            return (
                <NLUExampleEditMode
                    floated='right'
                    example={row.original}
                    entities={entities}
                    intents={this.getIntentForDropdown(false)}
                    onSave={this.onEditExample}
                    onCancel={() => this.setState({ expanded: {} })}
                    postSaveAction='close'
                    projectId={projectId}
                />
            );
        }
        return null;
    }

    render() {
        const headerStyle = { textAlign: 'left', fontWeight: 800, paddingBottom: '10px' };
        const columns = this.getColumns();
        const {
            hideHeader, intents, entities, projectId,
        } = this.props;
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
                        let expandedChange;
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
                    SubComponent={can('nlu-data:w', projectId)
                        ? row => (
                            <NLUExampleEditMode
                                floated='right'
                                example={row.original}
                                entities={entities}
                                intents={this.getIntentForDropdown(false)}
                                onSave={this.onEditExample}
                                onCancel={() => this.setState({ expanded: {} })}
                                postSaveAction='close'
                            />
                        ) : null
                    }
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
