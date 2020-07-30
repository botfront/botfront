import ReactTable from "react-table-v6";
import PropTypes from "prop-types";
import React from "react";
import matchSorter from "match-sorter";
import {Icon, Label, Popup, Tab} from "semantic-ui-react";
import IntentMetrics from "./KeyMetrics";


export default class IntentReport extends React.Component {
    getReportData() {
        // // fix first line header by adding the missing "intent" header
        const report = this.props.report;
        let tokens = report.replace("avg / total", "avg/total");
        let reportRows = tokens.split(/\r\n|\r|\n/);
        reportRows = reportRows.slice(1, tokens.length - 1);
        const tableRows = [];
        reportRows.forEach(r => {
            const tokens = r.trim().split(/\s+/g);
            if (tokens.length === 5) { // the "None" intent row of the report splits in 4 tokens
                tableRows.push({
                    intent: tokens[0],
                    f1: tokens[3],
                    precision: tokens[1],
                    recall: tokens[2],
                    support: tokens[4],
                });
            }
        });

        return tableRows;
    }

    getPredictionsData() {
        return this.props.predictions.filter(
            (pred) => {
                return pred.predicted !== pred.intent;
            }
        );
    }

    render() {
        return <div>
            <br/>
            <IntentMetrics
                accuracy={this.props.accuracy}
                precision={this.props.precision}
                f1={this.props.f1_score}
            />
            <br/>
            <br/>
            <Tab menu={{pointing: true, secondary: true}} panes={this.getIntentPanes()}/>
        </div>
    }

    getIntentPanes() {
        return [
            {
                menuItem: 'Intent Misclassification',
                render: () => <div>
                    {this.getPredictionsData(true).length > 0 &&
                    <ReactTable
                        data={this.getPredictionsData(true)}
                        columns={this.getPredictionsColumns(true)}/>
                    }
                </div>
            },
            {
                menuItem:'Detailed Report',
                render: () => <ReactTable
                    data={this.getReportData()}
                    filterable
                    columns={this.getReportColums()}
                    minRows={1}
                    SubComponent={null}
                />
            }
        ]
    }


    getReportColums() {
        return [
            {
                accessor: 'intent',
                Header: "Intent",
                filterMethod: (filter, rows) =>
                    matchSorter(rows, filter.value, {keys: ["intent"]}),
                className: "left",
                filterAll: true
            },
            {
                accessor: 'f1',
                Header: () => (
                    <div>F1-Score <Popup trigger={<Icon name='question circle' color="grey"/>}
                                         content="A more general measure of the quality of your model based on precision and accuracy"/>
                    </div>
                ),
                className: "right",
                filterable: false,
                width: 100
            },
            {
                accessor: 'precision',
                Header: () => (
                    <div>Precision <Popup trigger={<Icon name='question circle' color="grey"/>}
                                          content="On 100 examples predicted 'greet', how many were actually labeled 'greet'" />
                    </div>
                ),
                className: "right",
                filterable: false,
                width: 100
            },
            {
                accessor: 'recall',
                Header: () => (
                    <div>Recall <Popup
                        trigger={<Icon name='question circle' color='grey' />}
                        content="On 100 examples labeled 'greet', how many were actually predicted 'greet'"
                    />
                    </div>
                ),
                className: "right",
                filterable: false,
                width: 100
            },
            {
                accessor: 'support',
                Header: () => (
                    <div>Support <Popup trigger={<Icon name='question circle' color="grey"/>}
                                        content='The number of examples for that intent'/></div>
                ),
                className: "right",
                filterable: false,
                width: 100
            },
        ];
    }

    getPredictionsColumns() {
        return [
            {
                accessor: 'text',
                Header: "Text",
                Cell: props => <div><Icon name="quote left" size="small"/>{props.value}</div>,
                className:'left',
            },
            {
                id: "intent",
                accessor: r => r.intent,
                Header: "Correct intent",
                filterMethod: (filter, rows) => {
                    return matchSorter(rows, filter.value, {keys: ["intent"]})
                },
                Cell: props => <div><Label basic>{props.value}</Label></div>,
                filterAll: true,
                width: 200
            },
            {
                id: 'predicted',
                accessor: r => r.predicted,
                Header: "Predicted intent",
                filterMethod: (filter, rows) => {
                    return matchSorter(rows, filter.value, {keys: ["predicted"]})
                },
                Cell: props => {
                    return <div>
                        {props.original.predicted === props.original.intent &&
                        <div><Label basic>{props.value}</Label></div>}
                        {props.original.predicted !== props.original.intent &&
                        <div><Label basic color='red'>{props.value ? props.value : 'None'}</Label></div>}
                    </div>
                },
                filterAll: true,
                width: 200
            },
            {
                id: 'equal',
                accessor: e => e.intent === e.predicted ? 1 : 0,
                show: false
            },
            {
                id: "confidence",
                accessor: p => Math.round(p.confidence * 100) / 100,
                Header: "Conf.",
                resizable: false,
                className: "right",
                width: 60
            },
        ];
    }
}

IntentReport.propTypes = {
    report: PropTypes.string.isRequired,
    accuracy: PropTypes.number.isRequired,
    precision: PropTypes.number.isRequired,
    f1_score: PropTypes.number.isRequired,
    predictions: PropTypes.array.isRequired,
};