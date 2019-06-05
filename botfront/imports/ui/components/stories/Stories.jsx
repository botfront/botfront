import {
    Container, Grid, Segment, Message,
} from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import { isEqual } from 'lodash';

import { StoryGroups } from '../../../api/storyGroups/storyGroups.collection';
import { wrapMeteorCallback } from '../utils/Errors';
import ItemsBrowser from '../common/Browser';
import StoriesEditor from './StoriesEditor';
import { PageMenu } from '../utils/Utils';
import './style.less';

class Stories extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            storyIndex: 0,
            selectedStories: [],
            saved: true,
            saving: false,
        };
    }

    componentDidUpdate() {
        // This updates the selected story if the user is not editing it
        // and if a new one has been fetched from the server
        const { storyIndex, saved, selectedStories } = this.state;
        const { stories, ready } = this.props;
        if (
            saved
            && ready
            && stories[storyIndex]
            && !isEqual(selectedStories, stories[storyIndex].stories)
        ) {
            // We can use setstate if its in a condition, to prevent a neverending loop
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({
                selectedStories: stories[storyIndex].stories,
            });
        }
    }

    handleAddStoryGroup = async (name) => {
        const { projectId, stories } = this.props;
        const newStories = [`## ${name}`];
        Meteor.call(
            'storyGroups.insert',
            {
                name,
                projectId,
                stories: newStories,
            },
            wrapMeteorCallback((err) => {
                if (!err) {
                    this.setState({
                        storyIndex: stories.length,
                        selectedStories: newStories,
                        saved: true,
                    });
                }
            }),
        );
    };

    handleMenuChange = (index) => {
        const { stories } = this.props;
        this.setState({
            storyIndex: index,
            selectedStories: stories[index] ? stories[index].stories : [''],
            saved: true,
        });
    };

    handleStoriesChange = (newStories) => {
        this.setState({
            selectedStories: newStories,
            saved: false,
        });
    };

    handleStoryDeletion = () => {
        const { stories } = this.props;
        const { storyIndex } = this.state;
        Meteor.call('storyGroups.delete', stories[storyIndex]);
    };

    handleSaveStory = () => {
        const { stories } = this.props;
        const { storyIndex, selectedStories } = this.state;
        this.setState({ saving: true });
        Meteor.call(
            'storyGroups.update',
            {
                ...stories[storyIndex],
                stories: selectedStories,
            },
            wrapMeteorCallback((err) => {
                if (!err) {
                    this.setState({ saving: false, saved: true });
                }
                this.setState({ saving: false });
            }),
        );
    };

    render() {
        const { stories } = this.props;
        const {
            storyIndex, selectedStories, saved, saving,
        } = this.state;
        return (
            <>
                <PageMenu title='Stories' icon='book' />
                <Container className='stories-container'>
                    <Segment>
                        <Grid>
                            <Grid.Column width={4}>
                                <ItemsBrowser
                                    data={stories}
                                    allowAddition
                                    index={storyIndex}
                                    onAdd={this.handleAddStoryGroup}
                                    onChange={this.handleMenuChange}
                                    nameAccessor='name'
                                    saveMode={!saved}
                                    onSave={this.handleSaveStory}
                                />
                            </Grid.Column>
                            <Grid.Column width={12}>
                                {stories[storyIndex] ? (
                                    <StoriesEditor
                                        stories={selectedStories}
                                        onChange={this.handleStoriesChange}
                                        disabled={saving}
                                    />
                                ) : (
                                    <Message content='select or create a story group' />
                                )}
                            </Grid.Column>
                        </Grid>
                    </Segment>
                </Container>
            </>
        );
    }
}

Stories.propTypes = {
    projectId: PropTypes.string.isRequired,
    ready: PropTypes.bool.isRequired,
    stories: PropTypes.array.isRequired,
};

const mapStateToProps = state => ({
    projectId: state.get('projectId'),
});

const StoriesContainer = connect(mapStateToProps)(Stories);

export default withTracker((props) => {
    const { project_id: projectId } = props.params;
    const storiesHandler = Meteor.subscribe('storiesGroup', projectId);

    return {
        ready: storiesHandler.ready(),
        stories: StoryGroups.find({}).fetch(),
    };
})(StoriesContainer);
