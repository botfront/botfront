import React from 'react';
import PropTypes from 'prop-types';
import ReactTable, { ReactTableDefaults } from 'react-table-v6';
import moment from 'moment';

const Table = (props) => {
    const {
        data,
        columns,
        bucketSize,
        numberColumns,
        customSorts,
    } = props;
    
    const renderCell = (cellProps, accessor, options) => {
        const cellContent = cellProps.original[accessor];
        if (options.temporal && accessor === 'bucket') {
            if (bucketSize === 'hour') {
                return `${moment(cellContent).format('HH:mm')} - ${moment(cellContent).add(59, 'minutes').format('HH:mm')}`;
            }
            return moment(cellContent).format('DD/MM/YYYY');
        }
        if (accessor === 'proportion' || accessor === 'frequency') {
            return `${cellContent.toFixed(2)}%`;
        }
        return cellContent;
    };

    const renderColumns = () => (
        columns.map(({ header, accessor, ...options }) => {
            const columnProps = {
                id: accessor,
                accessor,
                Header: accessor === 'bucket' ? (bucketSize === 'hour' ? 'Time' : 'Date') : header,
                Cell: cellProps => renderCell(cellProps, accessor, options),
            };
            if (numberColumns.includes(accessor)) {
                columnProps.className = 'number-column';
            }
            if (customSorts[accessor]) {
                if (customSorts[accessor] === 'disable') {
                    columnProps.sortable = false;
                }
                if (typeof customSorts[accessor] === 'function') {
                    columnProps.sortMethod = customSorts[accessor];
                }
            }
            return columnProps;
        })
    );

    return (
        <ReactTable
            data={data}
            columns={renderColumns()}
            pageSize={data.length}
            showPagination={false}
            className='table-chart'
            column={{ ...ReactTableDefaults.column, className: 'table-chart-column' }}
        />
    );
};

Table.propTypes = {
    data: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    bucketSize: PropTypes.string.isRequired,
    numberColumns: PropTypes.arrayOf(PropTypes.string),
    customSorts: PropTypes.object,
};
Table.defaultProps = {
    numberColumns: [
        'hits',
        'count',
        'proportion',
        'visits',
        'engagement',
        'length',
        'frequency',
    ],
    customSorts: {
        date: (a, b) => {
            const dateA = moment(a).valueOf();
            const dateB = moment(b).valueOf();
            if (dateA > dateB) return 1;
            if (dateA < dateB) return -1;
            return 0;
        },
        duration: 'disable',
    },
};

export default Table;
