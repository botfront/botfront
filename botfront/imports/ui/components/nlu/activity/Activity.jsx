import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { connect } from 'react-redux';
import moment from 'moment';
import { Message, Segment } from 'semantic-ui-react';
import { getActivity } from './queries';
import {
    upsertActivity as upsertActivityMutation,
    deleteActivity as deleteActivityMutation,
    addActivityToTraining as addActivityToTrainingMutation,
} from './mutations';
import { Loading } from '../../utils/Utils';

import ActivityDataTable from './ActivityDataTable';
import ActivityActions from './ActivityActions';

import PrefixDropdown from '../../common/PrefixDropdown';

function Activity(props) {
    const [sortType, setSortType] = useState('newest');

    const {
        modelId,
        entities,
        intents,
        project: { training: { endTime } = {} },
        projectId,
        linkRender,
    } = props;

    const {
        loading, error, data, refetch,
    } = useQuery(
        getActivity, { variables: { modelId } },
    );
    const [upsertActivity] = useMutation(upsertActivityMutation);
    const [deleteActivity] = useMutation(deleteActivityMutation);
    const [addActivityToTraining] = useMutation(addActivityToTrainingMutation);

    const validated = data ? data.getActivity.filter(a => a.validated) : [];
    
    const isUtteranceOutdated = ({ updatedAt }) => moment(updatedAt).isBefore(moment(endTime));

    const handleAddToTraining = (ids) => {
        addActivityToTraining({ variables: { modelId, ids } });
        refetch();
    };

    const handleUpdate = (d) => {
        upsertActivity({ variables: { modelId, data: d } });
        refetch();
    };

    const handleDelete = (ids) => {
        deleteActivity({ variables: { modelId, ids } });
        refetch();
    };

    const render = () => (
        <>
            <Segment.Group className='new-utterances-topbar' horizontal>
                <Segment className='new-utterances-topbar-section' tertiary compact floated='left'>
                    <ActivityActions
                        onEvaluate={linkRender}
                        onDelete={() => handleDelete(validated.map(u => u._id))}
                        onAddToTraining={() => handleAddToTraining(validated.map(u => u._id))}
                        onInvalidate={() => handleUpdate(validated.map(({ _id, validated: v }) => ({ _id, validated: !v })))}
                        numValidated={validated.length}
                        projectId={projectId}
                    />
                </Segment>
                <Segment className='new-utterances-topbar-section' tertiary compact floated='right'>
                    <PrefixDropdown
                        selection={sortType}
                        updateSelection={option => setSortType(option.value)}
                        options={[
                            { value: 'newest', text: 'Newest' },
                            { value: 'oldest', text: 'Oldest' },
                        ]}
                        prefix='Sort by'
                    />
                </Segment>
            </Segment.Group>
            
            <br />
            <ActivityDataTable
                utterances={data.getActivity}
                entities={entities}
                intents={intents}
                projectId={projectId}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                outDatedUtteranceIds={data.getActivity.filter(u => isUtteranceOutdated(u)).map(u => u._id)}
                modelId={modelId}
                sortBy={sortType}
            />
        </>
    );

    return (
        <Loading loading={!!(loading || error)}>
            {data && data.getActivity.length
                ? render()
                : <Message success icon='check' header='Congratulations!' content='You are up to date' />
            }
        </Loading>
    );
}

Activity.propTypes = {
    projectId: PropTypes.string.isRequired,
    modelId: PropTypes.string.isRequired,
    project: PropTypes.object.isRequired,
    entities: PropTypes.array.isRequired,
    intents: PropTypes.array.isRequired,
    linkRender: PropTypes.func.isRequired,
};

Activity.defaultProps = {
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

const ActivityWithRouter = withRouter(Activity);

export default connect(mapStateToProps)(ActivityWithRouter);
