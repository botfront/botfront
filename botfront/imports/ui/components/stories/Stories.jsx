import { withTracker } from 'meteor/react-meteor-data';
import { Container, Grid, Segment } from 'semantic-ui-react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import { StoryGroups } from '../../../api/storyGroups/storyGroups.collection';
import ItemsBrowser from '../common/Browser';
import { PageMenu } from '../utils/Utils';
import { wrapMeteorCallback } from '../utils/Errors';

class Stories extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            storyIndex: 0,
        };
    }

    handleAddStoryGroup = async (name) => {
        const { projectId } = this.props;
        Meteor.call(
            'storyGroups.insert',
            {
                name,
                projectId,
                stories: [],
            },
            wrapMeteorCallback((err, res) => console.log(err, res)),
        );
    }

    handleMenuChange = (index) => {
        this.setState({ storyIndex: index });
    }

    render() {
        const { stories } = this.props;
        const { storyIndex } = this.state;
        return (
            <>
                <PageMenu title='Stories' icon='book' />
                <Container>
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
                                />
                            </Grid.Column>
                            <Grid.Column width={12}>
                                Coucou
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

const StoriesContainer = connect(
    mapStateToProps,
)(Stories);

export default withTracker((props) => {
    const { project_id: projectId } = props.params;
    const storiesHandler = Meteor.subscribe('storiesGroup', projectId);

    return {
        ready: storiesHandler.ready(),
        stories: StoryGroups.find({}).fetch(),
    };
})(StoriesContainer);
