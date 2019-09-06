import PropTypes from 'prop-types';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import connectField from 'uniforms/connectField';
import {
    Dropdown, Grid, Segment, Input, Icon, Message, Header,
} from 'semantic-ui-react';
import { Projects } from '../../../../../api/project/project.collection';

// eslint-disable-next-line react/prefer-stateless-function
class FollowUpField extends React.Component {
    handleActionChange = (action) => {
        const {
            value: { delay },
            onChange,
        } = this.props;
        onChange({ action, delay });
    };

    handleDelayChange = (delay) => {
        const {
            value: { action },
            onChange,
        } = this.props;
        onChange({ action, delay });
    };

    handleDeleteFollowUp = () => {
        const { onChange } = this.props;
        onChange({ action: null, delay: 0 });
    };

    renderFollowUp = (value, responseNames, ready) => (
        <Segment clearing className='follow-up-editor'>
            <Grid>
                <Grid.Row>
                    <Grid.Column width={16}>
                        <Header as='h4' content={<><span className='conditional'>ONCE</span> this bot response is sent, trigger the following response:</>} />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row style={{ marginTop: '0.8em' }} verticalAlign='middle'>
                    <Grid.Column width={4} className='follow-up follow-up-dropdown'>
                        <Dropdown
                            searchInput={{ autoFocus: !value.action }}
                            icon='pointing right'
                            basic
                            fluid
                            button
                            labeled
                            className='icon'
                            placeholder='Select a follow up action'
                            search
                            selection
                            allowAdditions
                            value={value.action}
                            additionLabel='Action: '
                            onChange={(e, { value: action }) => this.handleActionChange(action)}
                            onAddItem={(e, { value: action }) => this.handleActionChange(action)}
                            options={responseNames.map(r => ({ text: r, value: r }))}
                            disabled={!ready}
                        />
                    </Grid.Column>
                    {value.action && (
                        <Grid.Column width={1} className='follow-up-delay-after'>
                            <Header as='h4' content={<>after</>} />
                        </Grid.Column>)
                    }
                    {value.action && (
                        <Grid.Column width={2} className='follow-up-delay-input'>
                            <Input
                                fluid
                                disabled={!ready}
                                placeholder='Delay (in seconds)'
                                type='number'
                                onChange={(e, { value: delay }) => this.handleDelayChange(delay)}
                                text={`${value.action} secs.`}
                                value={value.delay}
                            />
                        </Grid.Column>
                    )}
                    {value.action && (
                        <Grid.Column width={1} className='follow-up-delay-seconds'>
                            <Header as='h4' content={<>seconds.</>} />
                        </Grid.Column>)
                    }
                    {value.action && (
                        <Grid.Column width={1} textAlign='left' verticalAlign='middle' className='follow-up-delay-delete'>
                            <Icon name='close' basic link onClick={this.handleDeleteFollowUp} />
                        </Grid.Column>
                    )}
                    {value.action && (
                        <Grid.Column width={7} textAlign='left' verticalAlign='middle' className='follow-up-delay-tip'>
                            <Message
                                info
                                content='The delay is computed from the first message of the sequence.
                                If your response is a long sequence of messages, the delay must include the time to deliver the whole sequence.'
                            />
                        </Grid.Column>
                    )}
                </Grid.Row>
            </Grid>
        </Segment>
    );

    handleToggleFollowUp = (e, { checked }) => {
        if (!checked) {
            const { onChange } = this.props;
            onChange({ action: null, delay: 0 });
        }
    };

    render() {
        const { responseNames, ready, value } = this.props;
        return <>{this.renderFollowUp(value, responseNames, ready)}</>;
    }
}

FollowUpField.propTypes = {
    onChange: PropTypes.func.isRequired,
    ready: PropTypes.bool,
    value: PropTypes.object.isRequired,
    responseNames: PropTypes.array,
};

FollowUpField.defaultProps = {
    responseNames: [],
    ready: false,
};

const FollowUpFieldContainer = withTracker((props) => {
    const { projectId } = props;
    const handler = Meteor.subscribe('template-keys', projectId);
    if (!handler.ready()) return {};

    const project = Projects.findOne({ _id: projectId }, { 'templates.key': 1 });
    const responseNames = project.templates.map(r => r.key);
    return {
        ready: handler.ready(),
        responseNames,
    };
})(FollowUpField);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connectField(connect(mapStateToProps)(FollowUpFieldContainer));
