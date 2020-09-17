import React, { useContext, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Statistic, Button } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';
import { saveAs } from 'file-saver';
import { Stories as StoriesCollection } from '../../../../api/story/stories.collection';
import { Loading } from '../../utils/Utils';
import IntentLabel from '../common/IntentLabel';
import DataTable from '../../common/DataTable';
import { ProjectContext } from '../../../layouts/context';
import { GET_INTENT_STATISTICS, GET_EXAMPLE_COUNT } from './graphql';


const Statistics = (props) => {
    const {
        examples, synonyms, gazettes, intents, entities, storyCount, ready, projectId, workingLanguage,
    } = props;

    const { projectLanguages } = useContext(ProjectContext);
    const { data, loading, refetch } = useQuery(
        GET_INTENT_STATISTICS, { variables: { projectId, language: workingLanguage } },
    );

    // always refetch on first page load
    useEffect(() => { if (refetch) refetch(); }, [refetch, workingLanguage]);

    const getDataToDisplay = () => !loading
        && data.getIntentStatistics.map(({ intent, example, counts }) => {
            const row = { intent, example: example ? example.text : null };
            counts.forEach(({ language, count }) => {
                row[language] = count;
            });
            return row;
        })
            .sort((r1, r2) => (r2[workingLanguage] || 0) - (r1[workingLanguage] || 0));

    const dataToDisplay = useMemo(() => getDataToDisplay(), [data]);

    const downloadData = () => {
        const headers = ['intent', 'example', ...projectLanguages.map(l => l.value)];
        const csvData = (dataToDisplay || []).reduce((acc, curr) => {
            let row = '';
            headers.forEach((h) => { row += `"${`${(curr[h] || '')}`.replace('"', '""')}",`; });
            return [...acc, row];
        }, [headers.map(h => `"${h}"`)]).join('\n');
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
        return saveAs(blob, `nlu_statistics_${projectId}_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const renderCards = () => {
        const cards = [
            { label: 'Examples', value: examples },
            { label: 'Intents', value: intents.length },
            { label: 'Entities', value: entities.length },
            { label: 'Synonyms', value: synonyms },
            { label: 'Gazettes', value: gazettes },
            { label: 'Stories', value: storyCount },
        ];

        return cards.map(d => (
            <div className='glow-box' style={{ width: `calc(100% / ${cards.length})` }} key={d.label}>
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
        return datum.example;
    };

    const countColumns = projectLanguages.map(({ value }) => ({
        key: value,
        header: value,
        style: { width: '110px', ...(value === workingLanguage ? { fontWeight: 'bold' } : {}) },
    }));

    const columns = [
        {
            key: 'intent', header: 'Intent', style: { width: '200px', minWidth: '200px', overflow: 'hidden' }, render: renderIntent,
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
                        <div className='side-by-side'>
                            <h3>Examples per intent</h3>
                            <Button onClick={downloadData} disabled={!(dataToDisplay || []).length} icon='download' basic />
                        </div>
                        <br />
                        <DataTable
                            columns={columns}
                            data={dataToDisplay}
                        />
                    </div>
                )
                : null
            }
        </Loading>
    );
};

Statistics.propTypes = {
    examples: PropTypes.number.isRequired,
    synonyms: PropTypes.number.isRequired,
    gazettes: PropTypes.number.isRequired,
    intents: PropTypes.array.isRequired,
    entities: PropTypes.array.isRequired,
    ready: PropTypes.bool.isRequired,
    storyCount: PropTypes.number.isRequired,
    projectId: PropTypes.string.isRequired,
    workingLanguage: PropTypes.string.isRequired,
};

const StatisticsWithStoryCount = withTracker((props) => {
    const { projectId, workingLanguage: language } = props;
    const storiesHandler = Meteor.subscribe('stories.light', projectId);
    const { data } = useQuery(GET_EXAMPLE_COUNT, { variables: { projectId, language } });
    const { totalLength: examples = 0 } = data?.examples?.pageInfo || {};

    return {
        ready: storiesHandler.ready(),
        examples,
        storyCount: StoriesCollection.find().count(),
    };
})(Statistics);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
    workingLanguage: state.settings.get('workingLanguage'),
});

export default connect(mapStateToProps)(StatisticsWithStoryCount);
