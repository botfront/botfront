import PropTypes from 'prop-types';
import React from 'react';
import { Tab } from 'semantic-ui-react';
import KeyMetrics from './KeyMetrics';
import ReportTable from './ReportTable';

export default class EntityReport extends React.Component {
    getPanes() {
        const { report } = this.props;
        return [
            {
                menuItem: 'Detailed Report',
                render: () => <ReportTable report={report} labelType='entity' />,
            },
        ];
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

EntityReport.propTypes = {
    report: PropTypes.string.isRequired,
    accuracy: PropTypes.number.isRequired,
    precision: PropTypes.number.isRequired,
    f1_score: PropTypes.number.isRequired,
};
