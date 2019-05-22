import React from 'react';
import PropTypes from 'prop-types';
import { sortBy } from 'lodash';
import { Divider, Icon, Tab } from 'semantic-ui-react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import matchSorter from 'match-sorter';
import AddLookupTableRow from './AddLookupTableRow';
import LookupTableValueEditorViewer from './LookupTableValueEditorViewer';
import LookupTableEditorViewer from './LookupTableListEditorViewer';
import { can } from '../../../lib/scopes';

export default class LookupTable extends React.Component {
    getColumns() {
        const {
            listAttribute, header, onItemChanged, extraColumns, onItemDeleted, projectId,
        } = this.props;
        let columns = [
            {
                id: 'value',
                accessor: s => s,
                Header: 'Value',
                className: 'lookup-value',
                filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: ['value.value'] }),
                sortMethod: (rowA, rowB) => rowA.value.localeCompare(rowB.value),
                Cell: props => <LookupTableValueEditorViewer listAttribute={listAttribute} entitySynonym={props.value} onEdit={onItemChanged} projectId={projectId} />,
                width: 200,
                filterAll: true,
            },
            {
                id: listAttribute,
                accessor: s => s,
                Header: header,
                filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: ['text'] }),
                sortMethod: (rowA, rowB) => rowA[listAttribute].join(' ').localeCompare(rowB[listAttribute].join(' ')),
                className: 'lookup-list',
                Cell: ({ value }) => {
                    // eslint-disable-next-line no-param-reassign
                    value[listAttribute] = sortBy(value[listAttribute]);
                    return (
                        <div>
                            <LookupTableEditorViewer listAttribute={listAttribute} entitySynonym={value} onEdit={onItemChanged} projectId={projectId} />
                        </div>
                    );
                },
                filterAll: true,
            },
            {
                id: 'text',
                accessor: s => s[listAttribute].join(' '),
                show: false,
            },
        ];

        if (extraColumns) columns = columns.concat(extraColumns);

        if (can('nlu-data:w', projectId)) {
            columns.push({
                id: 'delete',
                accessor: s => s,
                filterable: false,
                width: 35,
                className: 'center',
                Cell: ({ value }) => <Icon link className='delete-entity-synonym' size='tiny' name='remove' color='grey' onClick={() => onItemDeleted(value)} />,
            });
        }

        return columns;
    }

    render() {
        const {
            listAttribute, data, onItemChanged, valuePlaceholder, listPlaceholder, projectId,
        } = this.props;
        return (
            <Tab.Pane>
                {can('nlu-data:w', projectId) && <AddLookupTableRow listAttribute={listAttribute} onAdd={onItemChanged} valuePlaceholder={valuePlaceholder} listPlaceholder={listPlaceholder} /> }
                {can('nlu-data:w', projectId) && <Divider />}
                <ReactTable filterable data={data} columns={this.getColumns()} />
            </Tab.Pane>
        );
    }
}

LookupTable.propTypes = {
    data: PropTypes.array.isRequired,
    header: PropTypes.string.isRequired,
    listAttribute: PropTypes.string.isRequired,
    extraColumns: PropTypes.array,
    onItemChanged: PropTypes.func.isRequired,
    onItemDeleted: PropTypes.func.isRequired,
    valuePlaceholder: PropTypes.string.isRequired,
    listPlaceholder: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
};

LookupTable.defaultProps = {
    extraColumns: [],
};
