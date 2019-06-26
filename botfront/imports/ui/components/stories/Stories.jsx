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
        const { projectId, storyGroups } = this.props;
        Meteor.call(
            'storyGroups.insert',
            {
                name,
                projectId,
            },
            wrapMeteorCallback((err, groupId) => {
                if (!err) {
                    this.setState({
                        storyIndex: storyGroups.length,
                        validationErrors: false,
                    });
                    Meteor.call('stories.insert', {
                        story: `## ${name}`,
                        storyGroupId: groupId,
                        projectId,
                    });
                }
            }),
        );
    };

    deleteCurrentStory = (storyGroup) => {
        Meteor.call(
            'storyGroups.delete',
            storyGroup,
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
        const { projectId, storyGroups } = this.props;
        const { storyIndex } = this.state;
        Meteor.call(
            'stories.insert',
            {
                story: `## ${storyGroups[storyIndex].name}`,
                projectId,
                storyGroupId: storyGroups[storyIndex]._id,
            },
            wrapMeteorCallback(),
        );
    };

    handleDeleteGroup = (index) => {
        const { storyGroups } = this.props;
        Meteor.call(
            'storyGroups.delete',
            storyGroups[index],
            wrapMeteorCallback(),
        );
    };

    handleUpdateStoryGroup = (storyGroup) => {
        // eslint-disable-next-line no-param-reassign
        storyGroup.selected = !storyGroup.selected;
        Meteor.call(
            'storyGroups.update',
            storyGroup,
            wrapMeteorCallback(),
        );
    }

    render() {
        const { storyGroups, projectId } = this.props;
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
                        data={storyGroups}
                        allowAddition
                        index={storyIndex}
                        onAdd={this.handleAddStoryGroup}
                        onChange={this.handleMenuChange}
                        nameAccessor='name'
                        saving={saving}
                        icon='grid layout'
                        toggleSelect={this.handleUpdateStoryGroup}
                    />
                </Grid.Column>
                <Grid.Column width={12}>
                    {storyGroups[storyIndex] ? (
                        <StoriesEditor
                            storyGroup={storyGroups[storyIndex]}
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
    storyGroups: PropTypes.array.isRequired,
};

export default Stories;
