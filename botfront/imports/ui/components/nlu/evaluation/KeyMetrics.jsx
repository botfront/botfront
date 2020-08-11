import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Popup, Statistic } from 'semantic-ui-react';

export default class KeyMetrics extends React.PureComponent {
    formatStat = (stat) => {
        const toFloat = parseFloat(stat);
        return `${(toFloat * 100).toFixed(2)}%`;
    };

    render() {
        const { f1, precision, accuracy } = this.props;
        const data = [
            {
                label: 'F1-Score',
                value: f1,
                help: 'A general measure of the quality of your model based on precision and accuracy',
            },
            {
                label: 'Precision',
                value: precision,
                help: 'On 100 predictions for label, how many were actually labeled as such in test set',
            },
            {
                label: 'Accuracy',
                value: accuracy,
                help: 'On 100 instances of label in test set, how many were actually predicted',
            },
        ];

        return (
            <div>
                <Statistic.Group widths={data.length}>{
                    data.map((d, index) => (
                        <Statistic key={index}>
                            <Statistic.Label>{d.label} <Popup trigger={<Icon name='question circle' color='grey' />} content={d.help} /></Statistic.Label>
                            <Statistic.Value>{this.formatStat(d.value)}</Statistic.Value>
                        </Statistic>
                    ))
                }
                </Statistic.Group>
            </div>
        );
    }
}

KeyMetrics.propTypes = {
    f1: PropTypes.number.isRequired,
    accuracy: PropTypes.number.isRequired,
    precision: PropTypes.number.isRequired,
};
