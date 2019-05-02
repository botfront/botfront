import React from "react";
import PropTypes from "prop-types";
import {Meteor} from "meteor/meteor";
import {Button, Form, Icon, Label, Loader, Message, Popup, Statistic, Tab} from "semantic-ui-react";


export class Metrics extends React.Component {


    formatStat = (stat) => {
        const toFloat = parseFloat(stat);
        return (toFloat * 100).toFixed(2) + '%';
    };

    renderStatistics = () => {
        return this.props.data.map((d,index)=> <Statistic key={index}>
            <Statistic.Label>{d.label} <Popup trigger={<Icon name='question circle' color="grey"/>}content={d.help} /></Statistic.Label>
            <Statistic.Value>{this.formatStat(d.value)}</Statistic.Value>
        </Statistic>)
    };

    render() {

        return (
            <div>
                <Statistic.Group widths={this.props.data.length}>{this.renderStatistics()}
                </Statistic.Group>
            </div>
        )
    }
}

export default class IntentMetrics extends React.Component {
    render() {
        const data = [
            {
                label: "F1-Score",
                value: this.props.f1,
                help: "A more general measure of the quality of your model based on precision and accuracy"
            },
            {
                label: "Precision",
                value: this.props.precision,
                help: "On 100 examples predicted 'greet', how many were actually labeled 'greet'"
            },
            {
                label: "Accuracy",
                value: this.props.accuracy,
                help: "On 100 examples labeled 'greet', how many were actually predicted 'greet'"
            },
        ];

        return <Metrics data={data}/>
    }
}

IntentMetrics.propTypes = {
    f1: PropTypes.number.isRequired,
    accuracy: PropTypes.number.isRequired,
    precision: PropTypes.number.isRequired,
};

