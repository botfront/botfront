import React from 'react';
import PropTypes from 'prop-types';
import { Statistic, Tab, Grid } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import PieChart from '../../charts/PieChart';


export default class Statistics extends React.Component {
    entityDistribution = {
        query: gql`
            query EntityDistribution($modelId: String!) {
                entityDistribution(modelId: $modelId) {
                    entity
                    count
                }
            }
        `,
        queryName: 'entityDistribution',
        graphParams: { x: 'entity', y: [{ abs: 'count' }] },
    };

    intentDistribution = {
        query: gql`
            query IntentDistribution($modelId: String!) {
                intentDistribution(modelId: $modelId) {
                    intent
                    count
                }
            }
        `,
        queryName: 'intentDistribution',
        graphParams: { x: 'intent', y: [{ abs: 'count' }] },
    };

    renderStatistics() {
        const {
            model: { training_data: trainingData },
            intents,
            entities,
        } = this.props;
        const data = [
            {
                label: 'Examples',
                value: trainingData.common_examples.length,
            },
            { label: 'Intents', value: intents.length },
            { label: 'Entities', value: entities.length },
            {
                label: 'Synonyms',
                value: trainingData.entity_synonyms.length,
            },
        ];

        return data.map((d, index) => (
            <Statistic key={index}>
                <Statistic.Value>{d.value}</Statistic.Value>
                <Statistic.Label>{d.label}</Statistic.Label>
            </Statistic>
        ));
    }

    renderDistribution = ({ query, queryName, graphParams }) => {
        const { model: { _id: modelId } } = this.props;
        return (
            <Query query={query} variables={{ modelId }}>
                {({ loading, error, data }) => {
                    if (loading) return 'Loading...';
                    if (error) return `Error! ${error.message}`;
                    return (
                        <PieChart
                            data={data[queryName]}
                            {...graphParams}
                            enableRadialLabels={false}
                        />
                    );
                }}
            </Query>
        );
    };

    render() {
        return (
            <Tab.Pane>
                <Statistic.Group widths='four'>{this.renderStatistics()}</Statistic.Group>
                <Grid>
                    <Grid.Row style={{ height: 500 }}>
                        <Grid.Column width={8} style={{ height: 500 }}>{this.renderDistribution(this.intentDistribution)}</Grid.Column>
                        <Grid.Column width={8} style={{ height: 500 }}>{this.renderDistribution(this.entityDistribution)}</Grid.Column>
                    </Grid.Row>
                </Grid>
                
                
            </Tab.Pane>
        );
    }
}
Statistics.propTypes = {
    model: PropTypes.object.isRequired,
    intents: PropTypes.array.isRequired,
    entities: PropTypes.array.isRequired,
};
