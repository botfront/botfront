import React from 'react';
import PropTypes from 'prop-types';
import matchSorter from 'match-sorter';
import ReactTable from 'react-table-v6';
import { Label, Icon } from 'semantic-ui-react';

export default function PredictionTable(props) {
    const { labelType } = props;

    const getPredictionsData = () => {
        const { predictions } = props;
        return predictions.filter(pred => pred.predicted !== pred[labelType]);
    };

    const getPredictionsColumns = () => [
        {
            accessor: 'text',
            Header: 'Text',
            Cell: p => (
                <div>
                    <Icon name='quote left' size='small' />
                    {p.value}
                </div>
            ),
            className: 'left',
        },
        {
            id: labelType,
            accessor: r => r[labelType],
            Header: `Correct ${labelType}`,
            filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: [labelType] }),
            Cell: p => (
                <div>
                    <Label basic>{p.value}</Label>
                </div>
            ),
            filterAll: true,
            width: 200,
        },
        {
            id: 'predicted',
            accessor: r => r.predicted,
            Header: 'Predicted intent',
            filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: ['predicted'] }),
            Cell: p => (
                <div>
                    {p.original.predicted === p.original.intent && (
                        <div>
                            <Label basic>{p.value}</Label>
                        </div>
                    )}
                    {p.original.predicted !== p.original.intent && (
                        <div>
                            <Label basic color='red'>
                                {p.value ? p.value : 'None'}
                            </Label>
                        </div>
                    )}
                </div>
            ),
            filterAll: true,
            width: 200,
        },
        {
            id: 'equal',
            accessor: e => (e.intent === e.predicted ? 1 : 0),
            show: false,
        },
        {
            id: 'confidence',
            accessor: p => Math.round(p.confidence * 100) / 100,
            Header: 'Conf.',
            resizable: false,
            width: 60,
        },
    ];

    return (
        <ReactTable
            data={getPredictionsData()}
            columns={getPredictionsColumns()}
        />
    );
}

PredictionTable.propTypes = {
    predictions: PropTypes.object.isRequired,
    labelType: PropTypes.string.isRequired,
};
