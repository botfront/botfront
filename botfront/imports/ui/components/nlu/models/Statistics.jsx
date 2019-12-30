import React from 'react';
import PropTypes from 'prop-types';
import { Statistic } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import { Stories as StoriesCollection } from '../../../../api/story/stories.collection';
import { Loading } from '../../utils/Utils';


class Statistics extends React.Component {
    renderStatistics() {
        const {
            model, intents, entities, storyCount,
        } = this.props;
        const data = [
            { label: 'Examples', value: model.training_data.common_examples.length },
            { label: 'Intents', value: intents.length },
            { label: 'Entities', value: entities.length },
            { label: 'Synonyms', value: model.training_data.entity_synonyms.length },
            { label: 'Gazettes', value: model.training_data.fuzzy_gazette.length },
            { label: 'Stories', value: storyCount },
        ];

        return data.map(d => (
            <div className='glow-box' style={{ width: `calc(100% / ${data.length})` }} key={d.label}>
                <Statistic>
                    <Statistic.Label>{d.label}</Statistic.Label>
                    <Statistic.Value>{d.value}</Statistic.Value>
                </Statistic>
            </div>
        ));
    }

    render() {
        const { ready } = this.props;
        return (
            <Loading loading={!ready}>
                <div className='side-by-side'>
                    {this.renderStatistics()}
                </div>
            </Loading>
        );
    }
}
Statistics.propTypes = {
    model: PropTypes.object.isRequired,
    intents: PropTypes.array.isRequired,
    entities: PropTypes.array.isRequired,
    ready: PropTypes.bool.isRequired,
    storyCount: PropTypes.number.isRequired,
};

const StatisticsWithStoryCount = withTracker((props) => {
    const { projectId } = props;
    const storiesHandler = Meteor.subscribe('stories.light', projectId);

    return {
        ready: storiesHandler.ready(),
        storyCount: StoriesCollection.find().count(),
    };
})(Statistics);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(StatisticsWithStoryCount);
