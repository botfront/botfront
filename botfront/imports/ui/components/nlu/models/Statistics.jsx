import React from 'react';
import PropTypes from 'prop-types';
import { Statistic } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import { Stories as StoriesCollection } from '../../../../api/story/stories.collection';
import { Loading } from '../../utils/Utils';
import IntentLabel from '../common/IntentLabel';
import DataTable from '../../common/DataTable';


const Statistics = (props) => {
    const {
        model, intents, entities, storyCount, ready,
    } = props;

    const data = [
        { intent: 'ha', text: 'wack', count: 4 },
        { intent: 'ho', text: 'wack wack', count: 100 },
        { intent: 'hasas', text: 'wack tack dack', count: 99 },
    ];
    const hasNextPage = false;
    const loading = false;
    const loadMore = () => {};


    const renderCards = () => {
        const cards = [
            { label: 'Examples', value: model.training_data.common_examples.length },
            { label: 'Intents', value: intents.length },
            { label: 'Entities', value: entities.length },
            { label: 'Synonyms', value: model.training_data.entity_synonyms.length },
            { label: 'Gazettes', value: model.training_data.fuzzy_gazette.length },
            { label: 'Stories', value: storyCount },
        ];

        return cards.map(d => (
            <div className='glow-box hoverable' style={{ width: `calc(100% / ${cards.length})` }} key={d.label}>
                <Statistic>
                    <Statistic.Label>{d.label}</Statistic.Label>
                    <Statistic.Value>{d.value}</Statistic.Value>
                </Statistic>
            </div>
        ));
    };

    const renderIntent = (row) => {
        const { datum } = row;
        return (
            <IntentLabel
                value={datum.intent ? datum.intent : ''}
                allowEditing={false}
            />
        );
    };

    const columns = [
        {
            key: 'intent', header: 'Intent', style: { width: '180px', minWidth: '180px', overflow: 'hidden' }, render: renderIntent,
        },
        {
            key: 'text', header: 'Example', style: { width: '100%' },
        },
        {
            key: 'count', header: 'Count', style: { width: '110px' },
        },
    ];

    return (
        <Loading loading={!ready}>
            <div className='side-by-side'>{renderCards()}</div>
            <br />
            {data && data.length
                ? (
                    <div className='glow-box'>
                        <DataTable
                            columns={columns}
                            data={data}
                            hasNextPage={hasNextPage}
                            loadMore={loading ? () => {} : loadMore}
                            gutterSize={0}
                        />
                    </div>
                )
                : null
            }
        </Loading>
    );
};

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
