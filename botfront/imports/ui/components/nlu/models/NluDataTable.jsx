import React from 'react';
import PropTypes from 'prop-types';
import {
    Checkbox, Icon, Tab, Grid,
} from 'semantic-ui-react';
import _, { difference } from 'lodash';
import ReactTable from 'react-table';
import { DebounceInput } from 'react-debounce-input';
import matchSorter from 'match-sorter';

import { _cleanQuery, includeSynonyms } from '../../../../lib/filterExamples';
import NLUExampleEditMode from '../../example_editor/NLUExampleEditMode';
import NLUExampleText from '../../example_editor/NLUExampleText';
import EntityUtils from '../../utils/EntityUtils';
import IntentNameEditor from './IntentViewer';
import 'react-select/dist/react-select.css';
import Filters from './Filters';
import { can } from '../../../../lib/scopes';

export default class NluDataTable extends React.Component {
    constructor(props) {
        super(props);
        const { examples } = this.props;
        this.state = {
            examples,
            expanded: {},
            filter: {
                intents: [],
                entities: [],
            },
            showFilters: true,
            showLabels: false,
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
        return examples.filter((e) => {
            if (!e.entities) e.entities = [];
            const intentOk = filter.intents.length === 0 || difference([e.intent], filter.intents).length === 0;
            const entitiesOk = !!e.entities && difference(filter.entities, e.entities.map(ent => ent.entity)).length === 0;
            return intentOk && entitiesOk;
        });
    };

    getColumns() {
        const {
            onRenameIntent, examples, projectId, intentColumns: intentColumnsProp,
        } = this.props;
        const intentColumns = intentColumnsProp || [
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
                    />
                ),
                filterAll: true,
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
                Filter: ({ filter, onChange }) => (
                    <DebounceInput minLength={1} debounceTimeout={300} style={{ width: '100%' }} value={filter ? filter.value : ''} onChange={event => onChange(event.target.value)} />
                ),
                sortMethod: (a, b) => a.text.localeCompare(b.text),
                sortable: true,
                accessor: e => e,
                Header: 'Example',
                Cell: props => <NLUExampleText example={props.value} entities={this.props.entities} showLabels={this.state.showLabels || this.props.showLabels} onSave={this.onEditExample} editable />,
                style: { overflow: 'visible' },
                filterMethod: (filter, rows) => {
                    let matchCriteria = { keys: ['text'] };
                    if (includeSynonyms(filter.value)) matchCriteria = { keys: ['text', '_original.extra'] };
                    return matchSorter(rows, _cleanQuery(filter.value), matchCriteria);
                },
                filterAll: true,
            },
        ];

        firstColumns = intentColumns.concat(firstColumns.concat(this.props.extraColumns || []));

        if (can('nlu-data:w', projectId)) {
            firstColumns.push({
                accessor: '_id',
                filterable: false,
                Cell: props => (
                    <div className='center' onClick={() => this.props.onDeleteExample(props.value)} className='nlu-delete-example'>
                        <Icon link name='delete' size='tiny' color='grey' />
                    </div>
                ),
                Header: '',
                width: 30,
            });
        }

        return firstColumns;
    }

    collapseExpanded = () => this.setState({ expanded: {} });

    scrapFilter() {
        return {
            intents: this.state.filter.intents.filter(intent => _.includes(this.props.intents, intent)),
            entities: this.state.filter.entities.filter(entity => _.includes(this.props.entities, entity)),
        };
    }

    render() {
        const columns = this.getColumns();
        const { projectId } = this.props;
        return (
            <Tab.Pane as='div'>
                {!this.props.hideHeader && (
                    <Grid style={{ paddingBottom: '12px' }}>
                        <Grid.Row>
                            <Grid.Column width={13} textAlign='left' verticalAlign='middle'>
                                <Filters intents={this.props.intents} entities={this.props.entities} filter={this.scrapFilter()} onChange={filter => this.setState({ filter })} />
                            </Grid.Column>
                            <Grid.Column width={3} textAlign='right' verticalAlign='middle'>
                                {this.props.entities.length > 0 && this.props.showLabels === undefined && (
                                    <Checkbox
                                        checked={this.state.showLabels}
                                        onChange={() => this.setState({
                                            showLabels: !this.state.showLabels,
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
                <div style={{ padding: '0px', background: '#fff' }}>
                    <ReactTable
                        data={this.getExamples()}
                        filterable
                        onFilteredChange={this.collapseExpanded}
                        onSortedChange={this.collapseExpanded}
                        onPageChange={(page) => {
                            this.setState({ expanded: {} });
                        }}
                        expanded={this.state.expanded}
                        onExpandedChange={(newExpanded, index, event) => {
                            if (newExpanded[index[0]] === false) {
                                newExpanded = {};
                            } else {
                                Object.keys(newExpanded).map((k) => {
                                    newExpanded[k] = parseInt(k) === index[0] ? {} : false;
                                });
                            }
                            this.setState({ expanded: newExpanded });
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
                        className=''
                        SubComponent={row => (
                            <NLUExampleEditMode
                                floated='right'
                                example={row.original}
                                entities={this.props.entities}
                                intents={this.getIntentForDropdown(false)}
                                onSave={this.onEditExample}
                                onCancel={() => this.setState({ expanded: {} })}
                                postSaveAction='close'
                                projectId={projectId}
                            />
                        )}
                    />
                </div>
            </Tab.Pane>
        );
    }
}

NluDataTable.propTypes = {
    examples: PropTypes.array,
    intents: PropTypes.array,
    entities: PropTypes.array,
    onEditExample: PropTypes.func.isRequired,
    onDeleteExample: PropTypes.func.isRequired,
    onRenameIntent: PropTypes.func,
    showLabels: PropTypes.bool,
    hideHeader: PropTypes.bool,
    extraColumns: PropTypes.array,
    intentColumns: PropTypes.arrayOf(PropTypes.object),
    easyEdit: PropTypes.bool,
    projectId: PropTypes.string.isRequired,
};

NluDataTable.defaultProps = {
    easyEdit: false,
};
