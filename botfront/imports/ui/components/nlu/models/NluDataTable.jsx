import React from 'react';
import PropTypes from 'prop-types';
import {
    Checkbox, Tab, Grid, Loader, Popup, Icon, Form,
} from 'semantic-ui-react';
import Alert from 'react-s-alert';
import 'react-s-alert/dist/s-alert-default.css';
import _, { difference } from 'lodash';
import ReactTable from 'react-table-v6';
import matchSorter from 'match-sorter';
import getColor from '../../../../lib/getColors';
import { _cleanQuery, includeSynonyms } from '../../../../lib/filterExamples';
import EntityUtils from '../../utils/EntityUtils';
import IntentLabel from '../common/IntentLabel';
import Filters from './Filters';
import { can } from '../../../../lib/scopes';
import IconButton from '../../common/IconButton';
import UserUtteranceViewer from '../common/UserUtteranceViewer';
import { ExampleTextEditor } from '../../example_editor/ExampleTextEditor';

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
            editExampleMode: null,
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
            extraColumns, onDeleteExample, onSwitchCanonical, projectId,
        } = this.props;
        const canEdit = can('nlu-data:w', projectId);
        let { intentColumns } = this.props;
        const { waiting } = this.state;
        intentColumns = intentColumns || [
            {
                accessor: 'intent',
                Header: 'Intent',
                width: 200,
                filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: ['intent'] }),
                Cell: props => this.canonicalTooltip(
                    <span className='example-intent-cell'>
                        <IntentLabel
                            value={props.value}
                            allowEditing={!props.row.example.canonical && canEdit}
                            allowAdditions
                            onChange={intent => this.onEditExample({ ...props.row.example, intent })}
                        />
                    </span>,
                    props.row.example.canonical,
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
                Cell: (props) => {
                    const canonical = props.row.example.canonical ? props.row.example.canonical : false;
                    const { editExampleMode } = this.state;
                    const exampleId = props.row.example._id;
                    if (editExampleMode === exampleId) {
                        return (
                            <Form className='example-editor-form' data-cy='example-editor-form'>
                                <ExampleTextEditor
                                    inline
                                    autofocus
                                    example={props.row.example}
                                    onBlur={this.handleExampleTextareaBlur}
                                    onEnter={this.handleExampleTextareaBlur}
                                    disableNewEntities={editExampleMode === exampleId}
                                />
                            </Form>
                        );
                    }
                    return this.canonicalTooltip(
                        <div className='example-table-row'>
                            <UserUtteranceViewer
                                value={props.value}
                                onChange={this.onEditExample}
                                projectId=''
                                disableEditing={canonical}
                                showIntent={false}
                            />
                            {canEdit && (
                                <IconButton
                                    toolTip={canonical ? <>Cannot edit a canonical example</> : null}
                                    toolTipInverted
                                    disabled={canonical}
                                    basic
                                    icon='edit'
                                    onClick={e => this.handleEditExampleClick(e, exampleId)}
                                    iconClass={canonical ? 'disabled-delete' : undefined}
                                />
                            )}
                        </div>,
                        canonical,
                    );
                },
                style: { overflow: 'visible' },
            },
        ];

        firstColumns = intentColumns.concat(firstColumns.concat(extraColumns || []));
        
        firstColumns.push({
            accessor: '_id',
            filterable: false,
            Cell: (props) => {
                if (waiting.has(props.row.example._id)) {
                    return (<Loader className='loader-canonical' active inline size='mini' data-cy='canonical-spinner' />);
                }
                const canonical = props.row.example.canonical ? props.row.example.canonical : false;
                let toolTip = (<div>Mark as canonical</div>);

                if (!canonical && !canEdit) return null; // don't show anything

                if (canonical) {
                    toolTip = (
                        <>
                            <Popup.Header>Canonical Example</Popup.Header>
                            <Popup.Content className='popup-canonical'>
                                This example is canonical for the intent
                                <span className='intent-name'>
                                    {' '}
                                    {props.row.example.intent}
                                </span>
                                {props.row.example.entities
                                    && props.row.example.entities.length > 0 ? (
                                        <>
                                            and for the following entity - entity value
                                            combinations: <br />
                                            {props.row.example.entities.map(entity => (
                                                <span key={`${entity.entity}${entity.value}`}>
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
                    <Popup
                        position='top center'
                        disabled={toolTip === null || !canEdit}
                        trigger={(
                            <div>
                                <IconButton
                                    active={canonical}
                                    icon='gem'
                                    basic
                                    disabled={toolTip === null || !canEdit}
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
                                    data-cy='icon-gem'
                                />
                            </div>
                        )}
                        inverted={!canonical}
                        content={toolTip}
                    />
                );
            },
            Header: '',
            width: 30,
        });

        if (canEdit) {
            firstColumns.push({
                accessor: '_id',
                filterable: false,
                Cell: (props) => {
                    const canonical = props.row.example.canonical ? props.row.example.canonical : false;
                    const { deleted } = props.row.example;
                    let className = canonical ? 'disabled-delete' : '';
                    className += props.row.example.deleted ? 'always-interactable' : '';
                    return (
                        <Popup
                            position='top center'
                            disabled={!canonical}
                            trigger={(
                                <div>
                                    <IconButton
                                        icon={deleted ? 'redo' : 'trash'}
                                        basic
                                        disabled={canonical}
                                        onClick={() => onDeleteExample(props.value)}
                                        data-cy='icon-trash'
                                        className={className}
                                    />
                                </div>
                            )}
                            inverted
                            content='Cannot delete a canonical example'
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
        const { projectId } = this.props;
        if (!canonical || !can('nlu-data:w', projectId)) return jsx;
        return (
            <Popup
                trigger={<div>{jsx}</div>}
                inverted
                content='Cannot edit a canonical example'
            />
        );
    }

    collapseExpanded = () => this.setState({ expanded: {} });

    handleExampleTextareaBlur = (example) => {
        this.setState({ editExampleMode: null });
        this.onEditExample(example);
    }

    handleEditExampleClick = (event, exampleId) => {
        const { editExampleMode } = this.state;
        if (editExampleMode === exampleId) return;
        this.setState({ editExampleMode: exampleId });
    }

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
        const {
            hideHeader, intents, entities, conditionalRowFormatter, className,
        } = this.props;
        const { expanded, onlyCanonical } = this.state;
        return (
            <Tab.Pane as='div' className={className}>
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
                        getTrProps={(__, rowInfo = {}) => {
                            if (!conditionalRowFormatter) return {};
                            return conditionalRowFormatter(rowInfo.original);
                        }}
                        className=''
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
    conditionalRowFormatter: PropTypes.func,
    className: PropTypes.string,
};

NluDataTable.defaultProps = {
    conditionalRowFormatter: null,
    hideHeader: false,
    extraColumns: [],
    intentColumns: null,
    className: '',
};
