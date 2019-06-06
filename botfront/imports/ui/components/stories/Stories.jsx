import { Container, Grid, Message } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import { StoryGroups } from '../../../api/storyGroups/storyGroups.collection';
import { StoryValidator } from '../../../lib/story_validation';
import { wrapMeteorCallback } from '../utils/Errors';
import ItemsBrowser from '../common/Browser';
import StoriesEditor from './StoriesEditor';
import { PageMenu } from '../utils/Utils';
import ChangesSaved from '../utils/ChangesSaved';
import './style.less';

class Stories extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            storyIndex: 0,
            selectedStories: [],
            saving: false,
            validationErrors: [],
            displaySaved: false,
        };
    }

    componentDidUpdate() {
        // This updates the selected story if it hasnt been loaded yet
        // and if a new one has been fetched from the server
        const { storyIndex, saving, selectedStories } = this.state;
        const { stories, ready } = this.props;
        if (
            !saving
            && ready
            && selectedStories.length === 0
            && stories[storyIndex].stories.length > 0
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
                    });
                }
            }),
        );
    };

    saveCurrentStory = (stories) => {
        const { saving } = this.state;
        if (saving) return;
        this.setState({ saving: true });
        Meteor.call(
            'storyGroups.update',
            stories,
            wrapMeteorCallback(() => {
                this.setState({ saving: false });
            }),
        );
    };

    deleteCurrentStory = (story) => {
        Meteor.call(
            'storyGroups.delete',
            story,
            wrapMeteorCallback((err) => {
                if (!err) {
                    this.setState({
                        validationErrors: [],
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
            validationErrors: [],
        });
    };

    handleStoriesChange = (newStories) => {
        const { storyIndex } = this.state;
        const { stories } = this.props;
        if (newStories.length === 0) {
            this.deleteCurrentStory(stories[storyIndex]);
            return;
        }
        this.setState({
            selectedStories: newStories,
        });
        const validationErrors = this.validateStoryGroup(newStories);
        this.setState({ validationErrors });
        if (validationErrors.every(story => !story.length)) {
            this.saveCurrentStory({
                ...stories[storyIndex],
                stories: newStories,
            });
        }
    };

    validateStoryGroup = (group) => {
        const storiesValidation = [];
        group.forEach((story) => {
            const validator = new StoryValidator(story);
            validator.validateStories();
            if (!story.replace(/\s/g, '').length) {
                validator.exceptions.push({
                    type: 'error',
                    line: 1,
                    message: 'don\'t leave the story empty.',
                });
            }
            storiesValidation.push(validator.exceptions);
        });
        return storiesValidation;
    };

    render() {
        const { stories } = this.props;
        const {
            storyIndex,
            selectedStories,
            saving,
            validationErrors,
            displaySaved,
        } = this.state;
        return (
            <>
                <PageMenu title='Stories' icon='book' />
                <Container className='stories-container'>
                    <Grid>
                        <Grid.Column width={4}>
                            <ItemsBrowser
                                data={stories}
                                allowAddition
                                index={storyIndex}
                                onAdd={this.handleAddStoryGroup}
                                onChange={this.handleMenuChange}
                                nameAccessor='name'
                                saving={saving}
                            />
                        </Grid.Column>
                        <Grid.Column width={12}>
                            {displaySaved && <ChangesSaved />}
                            {stories[storyIndex] ? (
                                <StoriesEditor
                                    stories={selectedStories}
                                    onChange={this.handleStoriesChange}
                                    disabled={saving}
                                    errors={validationErrors}
                                />
                            ) : (
                                <Message content='select or create a story group' />
                            )}
                        </Grid.Column>
                    </Grid>
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
