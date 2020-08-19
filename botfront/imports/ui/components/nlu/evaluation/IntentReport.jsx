import PropTypes from 'prop-types';
import React from 'react';
import { Tab } from 'semantic-ui-react';
import KeyMetrics from './KeyMetrics';
import ReportTable from './ReportTable';
import PredictionTable from './PredictionTable';

export default class IntentReport extends React.Component {
    getPanes() {
        const { report, predictions } = this.props;
        const tabs = [{
            menuItem: 'Detailed Report',
            render: () => <ReportTable report={report} labelType='intent' />,
        }];
        if (predictions && predictions.length) {
            tabs.push(
                {
                    menuItem: 'Misclassifications',
                    render: () => <PredictionTable predictions={predictions} labelType='intent' />,
                },
            );
        }
        return tabs;
    }

    render() {
        const { accuracy, precision, f1_score: f1 } = this.props;
        return (
            <div>
                <br />
                <KeyMetrics
                    accuracy={accuracy}
                    precision={precision}
                    f1={f1}
                />
                <br />
                <br />
                <Tab
                    menu={{ pointing: true, secondary: true }}
                    panes={this.getPanes()}
                />
            </div>
        );
    }
}

IntentReport.propTypes = {
    report: PropTypes.string.isRequired,
    accuracy: PropTypes.number.isRequired,
    precision: PropTypes.number.isRequired,
    f1_score: PropTypes.number.isRequired,
    predictions: PropTypes.array.isRequired,
};
