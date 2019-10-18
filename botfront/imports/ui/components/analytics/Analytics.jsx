import {
    Container, Tab, Message, Loader,
} from 'semantic-ui-react';
import React from 'react';
import { Query } from 'react-apollo';

import { connect } from 'react-redux';
import gql from 'graphql-tag';
import ReactTable from 'react-table';
import PieChart from '../charts/PieChart';
import BarChart from '../charts/BarChart';

function Analytics(props) {
    const { projectId } = props;

    const renderConversationLengths = () => {
        const GET_CONVERSATIONS_LENGTH = gql`
            query ConversationLengths($projectId: String!) {
                conversationLengths(projectId: $projectId) {
                    frequency
                    count
                    length
                }
            }
        `;
        const params = {
            x: 'length', y: 'count', relY: 'frequency',
        };

        return (
            <Query query={GET_CONVERSATIONS_LENGTH} variables={{ projectId }}>
                {({ loading, error, data: { conversationLengths } }) => {
                    if (loading) return <Loader active inline='centered' />;
                    if (error) return `Error! ${error.message}`;
                    return (
                        <>
                            <Message content='# of user messages sent by conversation' />
                            <div style={{ height: 300 }}>
                                <PieChart
                                    data={conversationLengths}
                                    {...params}
                                />
                            </div>
                            <br />
                            <div style={{ height: 300 }}>
                                <BarChart
                                    data={conversationLengths}
                                    {...params}
                                />
                            </div>
                            {/* <ReactTable
                                data={conversationLengths.map(i => ({
                                    ...i,
                                    frequency: `${(i.frequency * 100).toFixed(2)}%`,
                                }))}
                                getTdProps={() => ({
                                    style: {
                                        textAlign: 'right',
                                    },
                                })}
                                columns={[
                                    {
                                        id: 'Length',
                                        accessor: 'length',
                                        Header: 'Length',
                                    },
                                    {
                                        id: 'count',
                                        accessor: 'count',
                                        Header: 'Count',
                                    },
                                    {
                                        id: 'frequency',
                                        accessor: 'frequency',
                                        Header: 'Frequency',
                                    },
                                ]}
                            /> */}
                            <br />
                        </>
                    );
                }}
            </Query>
        );
    };

    const renderIntentFrequencies = () => {
        const GET_INTENTS_FREQUENCIES = gql`
            query IntentFrequencies($projectId: String!) {
                intentFrequencies(
                    projectId: $projectId,
                    beg: 2,
                    end: 2,
                ) {
                    frequency
                    count
                    name
                }
            }
        `;

        const params = {
            x: 'name', y: 'count', relY: 'frequency',
        };

        return (
            <Query query={GET_INTENTS_FREQUENCIES} variables={{ projectId }}>
                {({ loading, error, data: { intentFrequencies } }) => {
                    if (loading) return <Loader active inline='centered' />;
                    if (error) return `Error! ${error.message}`;
                    return (
                        <>
                            <Message content='Most frequent user intents of 2nd message' />
                            <div style={{ height: 300 }}>
                                <PieChart
                                    data={intentFrequencies}
                                    {...params}
                                />
                            </div>
                        </>
                    );
                }}
            </Query>
        );
    };

    const renderConversationDurations = () => {
        const GET_CONVERSATION_DURATIONS = gql`
            query ConversationDurations($projectId: String!) {
                conversationDurations(projectId: $projectId) {
                    duration, count, frequency,
                }
            }
        `;

        const params = {
            x: 'duration', y: 'count', relY: 'frequency',
        };

        return (
            <Query query={GET_CONVERSATION_DURATIONS} variables={{ projectId }}>
                {({ loading, error, data: { conversationDurations } }) => {
                    if (loading) return <Loader active inline='centered' />;
                    if (error) return `Error! ${error.message}`;
                    return (
                        <>
                            {' '}
                            <Message content='# of conversations by duration' />
                            <div style={{ height: 300 }}>
                                <BarChart
                                    data={conversationDurations}
                                    {...params}
                                />
                            </div>
                        </>
                    );
                }}
            </Query>
        );
    };
    
    const panes = [
        {
            menuItem: 'Conversation lengths',
            render: () => <Tab.Pane>{renderConversationLengths()}</Tab.Pane>,
        },
        {
            menuItem: 'Conversation durations',
            render: () => <Tab.Pane>{renderConversationDurations()}</Tab.Pane>,
        },
        {
            menuItem: 'Intents frequencies',
            render: () => <Tab.Pane>{renderIntentFrequencies()}</Tab.Pane>,
        },
    ];

    return (
        <>
            <br />
            <Container>
                {<Tab menu={{ vertical: true, pointing: true }} panes={panes} />}
            </Container>
        </>
    );
}

Analytics.propTypes = {};

Analytics.defaultProps = {};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(Analytics);
