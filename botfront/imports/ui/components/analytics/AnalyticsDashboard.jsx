import React from 'react';
import { Container } from 'semantic-ui-react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import AnalyticsCard from './AnalyticsCard';
import conversationLengths from '../../../api/graphql/conversations/queries/conversationLengths.graphql';

function AnalyticsDashboard(props) {
    const { projectId } = props;

    return (
        <Container className='analytics-container'>
            <div className='analytics-dashboard'>
                <AnalyticsCard
                    chartTypeOptions={['line', 'bar']}
                    title='Conversation Lengths'
                    variables={{ projectId }}
                    query={conversationLengths}
                    queryName='conversationLengths'
                    graphParams={{ x: 'length', y: [{ abs: 'count', rel: 'frequency' }] }}
                />
            </div>
        </Container>
    );
}

AnalyticsDashboard.propTypes = {
    projectId: PropTypes.string.isRequired,
};

AnalyticsDashboard.defaultProps = {};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(AnalyticsDashboard);
