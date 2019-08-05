import React from 'react';
import PropTypes from 'prop-types';
import { Statistic, Tab, Grid } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import IntentDistributionWidget from '../../charts/IntentDistributionWidget';
import EntityDistributionWidget from '../../charts/EntityDistributionWidget';

export default class Statistics extends React.Component {
    renderStatistics() {
        const data = [
            {
                label: 'Examples',
                value: this.props.model.training_data.common_examples.length,
            },
            { label: 'Intents', value: this.props.intents.length },
            { label: 'Entities', value: this.props.entities.length },
            {
                label: 'Synonyms',
                value: this.props.model.training_data.entity_synonyms.length,
            },
        ];

        return data.map((d, index) => (
            <Statistic key={index}>
                <Statistic.Value>{d.value}</Statistic.Value>
                <Statistic.Label>{d.label}</Statistic.Label>
            </Statistic>
        ));
    }

    renderEntityDistribution = () => {
        const { model } = this.props;
        const GET_ENTITY_DISTRIBUTION = gql`
            query EntityDistribution($modelId: String!) {
                entityDistribution(modelId: $modelId) {
                    entity
                    count
                }
            }
        `;

        return (
            <Query query={GET_ENTITY_DISTRIBUTION} variables={{ modelId: model._id }}>
                {({ loading, error, data: { entityDistribution } }) => {
                    if (loading) return 'Loading...';
                    if (error) return `Error! ${error.message}`;
                    return (
                        <EntityDistributionWidget
                            data={entityDistribution.map(({ entity, count }) => ({
                                id: entity,
                                label: entity,
                                value: count,
                            }))}
                        />
                    );
                }}
            </Query>
        );
    };

    renderIntentDistribution = () => {
        const { model } = this.props;
        const GET_INTENT_DISTRIBUTION = gql`
            query IntentDistribution($modelId: String!) {
            intentDistribution(modelId: $modelId) {
                intent
                count
            }
        }
    `;

        return (
            <Query query={GET_INTENT_DISTRIBUTION} variables={{ modelId: model._id }}>
                {({ loading, error, data: { intentDistribution } }) => {
                    if (loading) return 'Loading...';
                    if (error) return `Error! ${error.message}`;
                    return (
                        <IntentDistributionWidget
                            data={intentDistribution.map(({ intent, count }) => ({
                                id: intent,
                                label: intent,
                                value: count,
                            }))}
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
                        <Grid.Column width={8} style={{ height: 500 }}>{this.renderIntentDistribution()}</Grid.Column>
                        <Grid.Column width={8} style={{ height: 500 }}>{this.renderEntityDistribution()}</Grid.Column>
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
