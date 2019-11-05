import React from 'react';
import PropTypes from 'prop-types';
import { Statistic, Tab } from 'semantic-ui-react';


export default class Statistics extends React.Component {
    renderStatistics() {
        const data = [
            { label: 'Examples', value: this.props.model.training_data.common_examples.length },
            { label: 'Intents', value: this.props.intents.length },
            { label: 'Entities', value: this.props.entities.length },
            { label: 'Synonyms', value: this.props.model.training_data.entity_synonyms.length },
        ];

        return data.map((d, index) => (
            <Statistic key={index}>
                <Statistic.Value>{d.value}</Statistic.Value>
                <Statistic.Label>{d.label}</Statistic.Label>
            </Statistic>
        ));
    }

    render() {
        return (
            <Tab.Pane>
                <Statistic.Group widths='four'>{this.renderStatistics()}
                </Statistic.Group>
            </Tab.Pane>
        );
    }
}
Statistics.propTypes = {
    model: PropTypes.object.isRequired,
    intents: PropTypes.array.isRequired,
    entities: PropTypes.array.isRequired,
};
