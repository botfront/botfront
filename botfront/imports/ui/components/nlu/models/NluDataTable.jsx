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
import 'react-select/dist/react-select.css'; // Is it used somewhere?
import Filters from './Filters';

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
        const { onRenameIntent, examples, projectId } = this.props;
        const intentColumns = this.props.intentColumns || [
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
                        entities={this.props.entities}
                        showLabels={this.state.showLabels || this.props.showLabels}
                        onSave={this.onEditExample}
                        editable
                    />
                ),
                style: { overflow: 'visible' },
            },
        ];

        firstColumns = intentColumns.concat(firstColumns.concat(this.props.extraColumns || []));
        firstColumns.push({
            accessor: '_id',
            filterable: false,
            Cell: props => (
                <div
                    className='center'
                    onClick={() => this.props.onDeleteExample(props.value)}
                    className='nlu-delete-example'
                >
                    <Icon link name='delete' size='tiny' color='grey' />
                </div>
            ),
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
        return (
            <Tab.Pane as='div'>
                {!this.props.hideHeader && (
                    <Grid style={{ paddingBottom: '12px' }}>
                        <Grid.Row>
                            <Grid.Column width={13} textAlign='left' verticalAlign='middle'>
                                <Filters
                                    intents={this.props.intents}
                                    entities={this.props.entities}
                                    filter={this.scrapFilter()}
                                    onChange={filter => this.setState({ filter })}
                                />
                            </Grid.Column>
                            <Grid.Column width={3} textAlign='right' verticalAlign='middle'>
                                {this.props.entities.length > 0
                                    && this.props.showLabels === undefined && (
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
                                entities={this.props.entities}
                                intents={this.getIntentForDropdown(false)}
                                onSave={this.onEditExample}
                                onCancel={() => this.setState({ expanded: {} })}
                                postSaveAction='close'
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
