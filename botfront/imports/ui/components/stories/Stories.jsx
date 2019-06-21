import { Grid, Message } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';

import { wrapMeteorCallback } from '../utils/Errors';
import ItemsBrowser from '../common/Browser';
import StoriesEditor from './StoriesEditor';
import './style.less';

class Stories extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            storyIndex: 0,
            saving: false,
            validationErrors: false,
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
                stories: newStories.map(story => ({ story })),
            },
            wrapMeteorCallback((err) => {
                if (!err) {
                    this.setState({
                        storyIndex: stories.length,
                        validationErrors: false,
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
                        validationErrors: false,
                        storyIndex: -1,
                    });
                }
            }),
        );
    };

    handleMenuChange = (index) => {
        this.setState({
            storyIndex: index,
            validationErrors: false,
        });
    };

    handleSavingStories = () => {
        this.setState({ saving: true });
    };

    handleSavedStories = () => {
        this.setState({ saving: false });
    };

    handleError = () => {
        this.setState({ validationErrors: true });
    };

    handleErrorResolved = () => {
        this.setState({ validationErrors: false });
    };

    handleNewStory = () => {
        const { projectId, stories } = this.props;
        const { storyIndex } = this.state;
        Meteor.call(
            'stories.insert',
            {
                story: `## ${stories[storyIndex].name}`,
                projectId,
                storyGroupId: stories[storyIndex]._id,
            },
            wrapMeteorCallback(),
        );
    };

    handleDeleteGroup = (index) => {
        const { stories } = this.props;
        Meteor.call('storyGroups.delete', stories[index], wrapMeteorCallback());
    };

    render() {
        const { stories, projectId } = this.props;
        const { storyIndex, saving, validationErrors } = this.state;
        return (
            <Grid className='stories-container'>
                <Grid.Column width={4}>
                    {validationErrors && (
                        <Message
                            warning
                            content="Your changes haven't been saved. Correct errors first."
                        />
                    )}
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
                    {stories[storyIndex] ? (
                        <StoriesEditor
                            storyGroup={stories[storyIndex]}
                            onSaving={this.handleSavingStories}
                            onSaved={this.handleSavedStories}
                            onError={this.handleError}
                            onErrorResolved={this.handleErrorResolved}
                            onAddNewStory={this.handleNewStory}
                            projectId={projectId}
                            onDeleteGroup={() => this.handleDeleteGroup(storyIndex)
                            }
                        />
                    ) : (
                        <Message content='select or create a story group' />
                    )}
                </Grid.Column>
            </Grid>
        );
    }
}

Stories.propTypes = {
    projectId: PropTypes.string.isRequired,
    stories: PropTypes.array.isRequired,
};

export default Stories;
