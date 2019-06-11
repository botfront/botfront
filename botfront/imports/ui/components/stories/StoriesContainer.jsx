import { Container, Placeholder } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import { StoryGroups } from '../../../api/storyGroups/storyGroups.collection';
import { PageMenu } from '../utils/Utils';

const Stories = React.lazy(() => import('./Stories'));

function StoriesContainer(props) {
    const { projectId, ready, stories } = props;

    function RenderPlaceHolder() {
        return (
            <Container>
                <Placeholder>
                    <Placeholder.Paragraph>
                        <Placeholder.Line />
                        <Placeholder.Line />
                        <Placeholder.Line />
                        <Placeholder.Line />
                        <Placeholder.Line />
                    </Placeholder.Paragraph>
                    <Placeholder.Paragraph>
                        <Placeholder.Line />
                        <Placeholder.Line />
                        <Placeholder.Line />
                    </Placeholder.Paragraph>
                </Placeholder>
            </Container>
        );
    }

    return (
        <>
            <PageMenu title='Stories' icon='book' />
            <React.Suspense fallback={<RenderPlaceHolder />}>
                {ready ? (
                    <Stories
                        projectId={projectId}
                        stories={stories}
                        ready={ready}
                    />
                ) : (
                    <RenderPlaceHolder />
                )}
            </React.Suspense>
        </>
    );
}

StoriesContainer.propTypes = {
    projectId: PropTypes.string.isRequired,
    ready: PropTypes.bool.isRequired,
    stories: PropTypes.array.isRequired,
};

const mapStateToProps = state => ({
    projectId: state.get('projectId'),
});

const StoriesWithState = connect(mapStateToProps)(StoriesContainer);

export default withTracker((props) => {
    const { project_id: projectId } = props.params;
    const storiesHandler = Meteor.subscribe('storiesGroup', projectId);

    return {
        ready: storiesHandler.ready(),
        stories: StoryGroups.find({}).fetch(),
    };
})(StoriesWithState);
