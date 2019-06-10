import { Container, Grid, Message } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';

import { StoryValidator } from '../../../lib/story_validation';
import { wrapMeteorCallback } from '../utils/Errors';
import ItemsBrowser from '../common/Browser';
import StoriesEditor from './StoriesEditor';
import ChangesSaved from '../utils/ChangesSaved';
import './style.less';

class Stories extends React.Component {
    constructor(props) {
        super(props);
        const { stories } = this.props;
        this.state = {
            storyIndex: 0,
            selectedStories: stories[0].stories ? stories[0].stories : [],
            saving: false,
            validationErrors: [],
            displaySaved: false,
        };
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
        );
    }
}

Stories.propTypes = {
    projectId: PropTypes.string.isRequired,
    stories: PropTypes.array.isRequired,
};

export default Stories;
