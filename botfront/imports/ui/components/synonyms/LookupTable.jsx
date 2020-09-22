import React from 'react';
import PropTypes from 'prop-types';
import { sortBy } from 'lodash';
import { Tab } from 'semantic-ui-react';
import ReactTable from 'react-table-v6';
import 'react-table-v6/react-table.css';
import matchSorter from 'match-sorter';
import AddLookupTableRow from './AddLookupTableRow';
import LookupTableValueEditorViewer from './LookupTableValueEditorViewer';
import LookupTableListEditorViewer from './LookupTableListEditorViewer';
import IconButton from '../common/IconButton';

export default class LookupTable extends React.Component {
    getColumns() {
        const {
            listAttribute, keyHeader, listHeader, onItemChanged, extraColumns, onItemDeleted, multiple, keyAttribute,
        } = this.props;
        let columns = [
            {
                id: keyAttribute,
                accessor: s => s,
                Header: keyHeader,
                className: 'lookup-value',
                filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: ['value.value'] }),
                sortMethod: (rowA, rowB) => rowA[keyAttribute].localeCompare(rowB[keyAttribute]),
                Cell: props => <LookupTableValueEditorViewer keyAttribute={keyAttribute} listAttribute={listAttribute} entitySynonym={props.value} onEdit={onItemChanged} />,
                width: 200,
            },
            {
                id: listAttribute,
                accessor: s => s,
                Header: listHeader,
                filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: ['text'] }),
                sortMethod: (rowA, rowB) => {
                    if (!multiple) return rowA[listAttribute];
                    return rowA[listAttribute].join(' ').localeCompare(rowB[listAttribute].join(' '));
                },
                className: 'lookup-list',
                Cell: ({ value }) => {
                    // eslint-disable-next-line no-param-reassign
                    if (multiple) value[listAttribute] = sortBy(value[listAttribute]);
                    return (
                        <div>
                            <LookupTableListEditorViewer keyAttribute={keyAttribute} listAttribute={listAttribute} entitySynonym={value} onEdit={onItemChanged} multiple={multiple} />
                        </div>
                    );
                },
            },
            {
                id: 'text',
                accessor: s => (multiple ? s[listAttribute].join(' ') : s[listAttribute]),
                show: false,
            },
        ];

        if (extraColumns) columns = columns.concat(extraColumns);

        columns.push({
            id: 'delete',
            accessor: s => s,
            filterable: false,
            width: 35,
            className: 'center',
            Cell: ({ value }) => (
                <IconButton
                    icon='trash'
                    basic
                    color='white'
                    onClick={() => onItemDeleted(value)}
                />
            ),
        });

        return columns;
    }

    render() {
        const {
            keyAttribute, listAttribute, data, onItemChanged, valuePlaceholder, listPlaceholder, multiple,
        } = this.props;
        const headerStyle = { textAlign: 'left', fontWeight: 800, paddingBottom: '10px' };
        return (
            <Tab.Pane as='div'>
                <AddLookupTableRow
                    keyAttribute={keyAttribute}
                    listAttribute={listAttribute}
                    onAdd={onItemChanged}
                    valuePlaceholder={valuePlaceholder}
                    listPlaceholder={listPlaceholder}
                    multiple={multiple}
                />
                <br />
                <div className='glow-box extra-padding no-margin'>
                    <ReactTable
                        data={data}
                        minRows={1}
                        columns={this.getColumns()}
                        getTheadThProps={() => ({
                            style: {
                                borderRight: 'none',
                                ...headerStyle,
                            },
                        })}
                    />
                </div>
            </Tab.Pane>
        );
    }
}

LookupTable.propTypes = {
    data: PropTypes.array.isRequired,
    keyHeader: PropTypes.string.isRequired,
    listHeader: PropTypes.string.isRequired,
    listAttribute: PropTypes.string.isRequired,
    keyAttribute: PropTypes.string.isRequired,
    extraColumns: PropTypes.array,
    onItemChanged: PropTypes.func.isRequired,
    onItemDeleted: PropTypes.func.isRequired,
    valuePlaceholder: PropTypes.string.isRequired,
    listPlaceholder: PropTypes.string.isRequired,
    multiple: PropTypes.bool,
};

LookupTable.defaultProps = {
    extraColumns: [],
    multiple: true,
};
