import React, { useContext, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Statistic } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';
import { Stories as StoriesCollection } from '../../../../api/story/stories.collection';
import { Loading } from '../../utils/Utils';
import IntentLabel from '../common/IntentLabel';
import DataTable from '../../common/DataTable';
import { ProjectContext } from '../../../layouts/context';
import { GET_INTENT_STATISTICS } from './graphql';


const Statistics = (props) => {
    const {
        model, intents, entities, storyCount, ready, projectId, workingLanguage,
    } = props;

    const { projectLanguages } = useContext(ProjectContext);
    const { data, loading, refetch } = useQuery(
        GET_INTENT_STATISTICS, { variables: { projectId, language: workingLanguage } },
    );

    // always refetch on first page load
    useEffect(() => { if (refetch) refetch(); }, [refetch, workingLanguage]);

    const getDataToDisplay = () => !loading
        && data.getIntentStatistics.map(({ intent, example, counts }) => {
            const row = { intent, example };
            counts.forEach(({ language, count }) => {
                row[language] = count;
            });
            return row;
        })
            .sort((r1, r2) => r2[workingLanguage] || 0 - r1[workingLanguage] || 0);

    const dataToDisplay = useMemo(() => getDataToDisplay());

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


    const renderExample = (row) => {
        const { datum } = row;
        if (!datum.example) return <i>No example defined.</i>;
        const { text } = datum.example;
        return text;
    };

    const countColumns = projectLanguages.map(({ text, value }) => ({
        key: value,
        header: text,
        style: { width: '110px', ...(value === workingLanguage ? { fontWeight: 'bold' } : {}) },
    }));

    const columns = [
        {
            key: 'intent', header: 'Intent', style: { width: '180px', minWidth: '180px', overflow: 'hidden' }, render: renderIntent,
        },
        {
            key: 'example', header: 'Example', style: { width: '100%' }, render: renderExample,
        },
        ...countColumns,
    ];

    return (
        <Loading loading={!ready || loading}>
            <div className='side-by-side'>{renderCards()}</div>
            <br />
            {dataToDisplay && dataToDisplay.length
                ? (
                    <div className='glow-box extra-padding'>
                        <DataTable
                            columns={columns}
                            data={dataToDisplay}
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
    projectId: PropTypes.string.isRequired,
    workingLanguage: PropTypes.string.isRequired,
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
    workingLanguage: state.settings.get('workingLanguage'),
});

export default connect(mapStateToProps)(StatisticsWithStoryCount);
