import {
    Container, Button, Tab, Message, Loader,
} from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import React, { useState, useEffect, useContext } from 'react';
import { Query } from 'react-apollo';

import { connect } from 'react-redux';
import gql from 'graphql-tag';
import ReactTable from 'react-table';
import ConversationLengthsWidget from '../charts/ConversationLengthsPieWidget';
import ConversationLengthsBarWidget from '../charts/ConversationLengthsBarsWidget';
import ConversationDurationsBarWidget from '../charts/ConversationDurationsBarsWidget';
import IntentFrequenciesWidget from '../charts/IntentsFrequenciesWidget';

function Analytics(props) {
    const { projectId } = props;
    const [errors, setErrors] = useState([]);

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

        return (
            <Query query={GET_CONVERSATIONS_LENGTH} variables={{ projectId }}>
                {({ loading, error, data: { conversationLengths } }) => {
                    if (loading) return <Loader active inline='centered' />;
                    if (error) return `Error! ${error.message}`;
                    return (
                        <>
                            <Message content='# of user messages sent by conversation' />
                            <div style={{ height: 500 }}>
                                <ConversationLengthsWidget
                                    data={conversationLengths.map(
                                        ({ length, frequency, count }) => ({
                                            id: length,
                                            label: length,
                                            strValue: `${(frequency * 100).toFixed(
                                                2,
                                            )}% (${count})`,
                                            value: (frequency * 100).toFixed(2),
                                        }),
                                    )}
                                />
                            </div>
                            <br />
                            <div style={{ height: 500 }}>
                                <ConversationLengthsBarWidget
                                    data={conversationLengths.map(
                                        ({ length, count, frequency }) => ({
                                            count,
                                            length,
                                        }),
                                    )}
                                    keys={['count']}
                                    width={900}
                                    height={500}
                                    margin={{
                                        top: 40,
                                        right: 80,
                                        bottom: 80,
                                        left: 80,
                                    }}
                                />
                            </div>
                            <ReactTable
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
                            />
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
                intentFrequencies(projectId: $projectId) {
                    frequency
                    count
                    name
                }
            }
        `;

        return (
            <Query query={GET_INTENTS_FREQUENCIES} variables={{ projectId }}>
                {({ loading, error, data: { intentFrequencies } }) => {
                    if (loading) return <Loader active inline='centered' />;
                    if (error) return `Error! ${error.message}`;
                    return (
                        <>
                            <Message content='Most frequent user intents of 1st message' />
                            <div style={{ height: 500 }}>
                                <IntentFrequenciesWidget
                                    data={intentFrequencies.map(
                                        ({ name, frequency, count }) => ({
                                            id: name,
                                            label: name,
                                            strValue: `${(frequency * 100).toFixed(
                                                2,
                                            )}% (${count})`,
                                            value: (frequency * 100).toFixed(2),
                                        }),
                                    )}
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

        return (
            <Query query={GET_CONVERSATION_DURATIONS} variables={{ projectId }}>
                {({ loading, error, data: { conversationDurations } }) => {
                    if (loading) return <Loader active inline='centered' />;
                    if (error) return `Error! ${error.message}`;
                    return (
                        <>
                            {' '}
                            <Message content='# of conversations by duration' />
                            <div style={{ height: 500 }}>
                                <ConversationDurationsBarWidget
                                    data={conversationDurations}
                                    width={900}
                                    height={500}
                                    margin={{
                                        top: 40,
                                        right: 80,
                                        bottom: 80,
                                        left: 80,
                                    }}
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
