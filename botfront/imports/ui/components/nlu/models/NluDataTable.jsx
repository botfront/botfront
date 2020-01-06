import React from 'react';
import PropTypes from 'prop-types';
import {
    Checkbox, Tab, Grid, Loader, Popup, Icon,
} from 'semantic-ui-react';
import Alert from 'react-s-alert';
import 'react-s-alert/dist/s-alert-default.css';
import _, { difference } from 'lodash';
import ReactTable from 'react-table-v6';
import matchSorter from 'match-sorter';
import getColor from '../../../../lib/getColors';
import { _cleanQuery, includeSynonyms } from '../../../../lib/filterExamples';
import NLUExampleEditMode from '../../example_editor/NLUExampleEditMode';
import EntityUtils from '../../utils/EntityUtils';
import IntentLabel from '../common/IntentLabel';
import Filters from './Filters';
import { can } from '../../../../lib/scopes';
import FloatingIconButton from '../../common/FloatingIconButton';
import UserUtteranceViewer from '../common/UserUtteranceViewer';

export default class NluDataTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            waiting: new Set(),
            filter: {
                intents: [],
                entities: [],
                query: '',
            },
            onlyCanonical: false,
        };
    }

    onEditExample = (example) => {
        const { onEditExample } = this.props;
        onEditExample(example, (err) => {
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
            const { onlyCanonical } = this.state;
            const canonicalOk = onlyCanonical ? e.canonical : true;
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
            extraColumns, onDeleteExample, onSwitchCanonical,
        } = this.props;
        let { intentColumns } = this.props;
        const { projectId } = this.props;
        const { waiting } = this.state;
        intentColumns = intentColumns || [
            {
                accessor: 'intent',
                Header: 'Intent',
                width: 200,
                filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: ['intent'] }),
                Cell: props => this.canonicalTooltip(
                    <IntentLabel
                        value={props.value}
                        allowEditing={!props.row.example.canonical && can('nlu-data:w', projectId)}
                        allowAdditions
                        onChange={intent => this.onEditExample({ ...props.row.example, intent })}
                    />,
                    props.row.example.canonical,
                ),
            },
        ];
        const expanderColumn = [{
            expander: true,
            Expander: (row) => {
                if (row.row.example.canonical) {
                    return null;
                }
                return (
                    <div>
                        {row.isExpanded
                            ? <Icon size='large' name='caret down' />
                            : <Icon size='large' name='caret right' />
                        }
                    </div>
                );
            },
        }];

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
                Cell: (props) => {
                    const canonical = props.row.example.canonical ? props.row.example.canonical : false;
                    return this.canonicalTooltip(
                        <UserUtteranceViewer
                            value={props.value}
                            onChange={this.onEditExample}
                            projectId=''
                            disableEditing={canonical}
                            showIntent={false}
                        />,
                        canonical,
                    );
                },
                style: { overflow: 'visible' },
            },
        ];

        firstColumns = expanderColumn.concat(intentColumns.concat(firstColumns.concat(extraColumns || [])));

        if (can('nlu-data:w', projectId)) {
            firstColumns.push({
                accessor: '_id',
                filterable: false,
                Cell: (props) => {
                    if (waiting.has(props.row.example._id)) {
                        return (<Loader className='loader-canonical' active inline size='mini' />);
                    }
                    const canonical = props.row.example.canonical ? props.row.example.canonical : false;
                    let toolTip = (<div>Mark as canonical</div>);
                    if (canonical) {
                        toolTip = (
                            <>
                                <Popup.Header>Canonical Example</Popup.Header>
                                <Popup.Content className='popup-canonical'>
                                This example is canonical for the intent
                                    <span className='intent-name'> {props.row.example.intent}</span>

                                    {props.row.example.entities && props.row.example.entities.length > 0
                                        ? (
                                            <>
                                            and for the following entity - entity value combinations: <br />
                                                {props.row.example.entities.map(entity => (
                                                    <span><strong style={{ color: getColor(entity.entity).backgroundColor }}>{entity.entity}</strong>: {entity.value}</span>
                                                ))}
                                            </>
                                        )
                                        : ''}
                                </Popup.Content>
                            </>
                        );
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
                        />
                    );
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
                            toolTipInverted
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
        }

        return firstColumns;
    }

    canonicalTooltip = (jsx, canonical) => {
        if (!canonical) return jsx;
        return (
            <Popup
                trigger={<div>{jsx}</div>}
                inverted
                content='Cannot edit a canonical example'
            />
        );
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
        const { expanded, onlyCanonical } = this.state;
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
                                    onChange={() => {
                                        this.setState({ onlyCanonical: !onlyCanonical });
                                    }
                                    }
                                    hidden={false}
                                    slider
                                    data-cy='only-canonical'
                                    readOnly={false}
                                    className='only-canonical'
                                />
                                <Popup
                                    trigger={
                                        <Icon name='gem' color={onlyCanonical ? 'black' : 'grey'} />
                                    }
                                    content='Only show canonicals examples'
                                    position='top center'
                                    inverted
                                />
                                
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                )}
                <div className='glow-box extra-padding no-margin'>
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
                        SubComponent={can('nlu-data:w', projectId)
                            ? (row) => {
                                if (row.row.example.canonical) return undefined;
                                return (
                                    <NLUExampleEditMode
                                        floated='right'
                                        example={row.original}
                                        entities={entities}
                                        intents={this.getIntentForDropdown(false)}
                                        onSave={this.onEditExample}
                                        onCancel={() => this.setState({ expanded: {} })}
                                        postSaveAction='close'
                                    />
                                );
                            } : null
                        }
                    />
                </div>
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
    hideHeader: PropTypes.bool,
    extraColumns: PropTypes.array,
    intentColumns: PropTypes.arrayOf(PropTypes.object),
    onSwitchCanonical: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
};

NluDataTable.defaultProps = {
    hideHeader: false,
    extraColumns: [],
    intentColumns: null,
};
