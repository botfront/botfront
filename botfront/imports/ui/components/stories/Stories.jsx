import { Grid, Message } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';

import { wrapMeteorCallback } from '../utils/Errors';
import ItemsBrowser from '../common/Browser';
import StoriesEditor from './StoriesEditor';
import { can } from '../../../lib/scopes';
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
                    Meteor.call('stories.insert',
                        {
                            story: `## ${name}`,
                            storyGroupId: groupId,
                            projectId,
                        },
                        projectId);
                }
            }),
        );
    };

    saveCurrentStory = (stories) => {
        const { saving } = this.state;
        const { projectId } = this.props;
        if (saving) return;
        this.setState({ saving: true });
        Meteor.call(
            'storyGroups.update',
            stories,
            projectId,
            wrapMeteorCallback(() => {
                this.setState({ saving: false });
            }),
        );
    };

    deleteCurrentStory = (storyGroup, projectId) => {
        Meteor.call(
            'storyGroups.delete',
            storyGroup,
            projectId,
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
            projectId,
            wrapMeteorCallback(),
        );
    };

    handleDeleteGroup = (index, projectId) => {
        const { storyGroups } = this.props;
        Meteor.call(
            'storyGroups.delete',
            storyGroups[index],
            projectId,
            wrapMeteorCallback(),
        );
    };

    render() {
        const { storyGroups, projectId } = this.props;
        const canAddStory = can('stories:w', projectId);
        const { storyIndex, saving, validationErrors } = this.state;
        const renderBrowser = storyGroups.length > 0 ? true : canAddStory;
        return (
            <Grid className='stories-container'>
                <Grid.Column width={4}>
                    {validationErrors && (
                        <Message
                            warning
                            content="Your changes haven't been saved. Correct errors first."
                        />
                    )}
                    {renderBrowser && (
                        <ItemsBrowser
                            data={storyGroups}
                            allowAddition
                            index={storyIndex}
                            onAdd={this.handleAddStoryGroup}
                            onChange={this.handleMenuChange}
                            nameAccessor='name'
                            saving={saving}
                            canAddItem={canAddStory}
                        />)
                    }
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
                            onDeleteGroup={() => this.handleDeleteGroup(storyIndex, projectId)
                            }
                        />
                    ) : (
                        canAddStory && (<Message content='select or create a story group' />)
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
