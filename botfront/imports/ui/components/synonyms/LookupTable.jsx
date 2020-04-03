import React from 'react';
import PropTypes from 'prop-types';
import { sortBy } from 'lodash';
import { Tab } from 'semantic-ui-react';
import ReactTable from 'react-table-v6';
import 'react-table-v6/react-table.css';
import matchSorter from 'match-sorter';
import AddLookupTableRow from './AddLookupTableRow';
import LookupTableValueEditorViewer from './LookupTableValueEditorViewer';
import LookupTableEditorViewer from './LookupTableListEditorViewer';
import IconButton from '../common/IconButton';

export default class LookupTable extends React.Component {
    getColumns() {
        const {
            listAttribute, header, onItemChanged, extraColumns, onItemDeleted,
        } = this.props;
        let columns = [
            {
                id: 'value',
                accessor: s => s,
                Header: 'Value',
                className: 'lookup-value',
                filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: ['value.value'] }),
                sortMethod: (rowA, rowB) => rowA.value.localeCompare(rowB.value),
                Cell: props => <LookupTableValueEditorViewer listAttribute={listAttribute} entitySynonym={props.value} onEdit={onItemChanged} />,
                width: 200,
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
                            <LookupTableEditorViewer listAttribute={listAttribute} entitySynonym={value} onEdit={onItemChanged} />
                        </div>
                    );
                },
            },
            {
                id: 'text',
                accessor: s => s[listAttribute].join(' '),
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
            listAttribute, data, onItemChanged, valuePlaceholder, listPlaceholder,
        } = this.props;
        const headerStyle = { textAlign: 'left', fontWeight: 800, paddingBottom: '10px' };
        return (
            <Tab.Pane as='div'>
                <AddLookupTableRow
                    listAttribute={listAttribute}
                    onAdd={onItemChanged}
                    valuePlaceholder={valuePlaceholder}
                    listPlaceholder={listPlaceholder}
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
    header: PropTypes.string.isRequired,
    listAttribute: PropTypes.string.isRequired,
    extraColumns: PropTypes.array,
    onItemChanged: PropTypes.func.isRequired,
    onItemDeleted: PropTypes.func.isRequired,
    valuePlaceholder: PropTypes.string.isRequired,
    listPlaceholder: PropTypes.string.isRequired,
};

LookupTable.defaultProps = {
    extraColumns: [],
};
