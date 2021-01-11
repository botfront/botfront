import { Meteor } from 'meteor/meteor';

import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { cloneDeep } from 'lodash';
import {
    Button, Confirm, Container, Header, Segment, Tab,
} from 'semantic-ui-react';
import React from 'react';
import {
    AutoForm,
    AutoField,
    ErrorsField,
    SubmitField,
} from 'uniforms-semantic';
import { browserHistory } from 'react-router';

import { UserEditSchema, UserCreateSchema } from '../../../api/user/user.schema';
import { can } from '../../../lib/scopes';
import { wrapMeteorCallback } from '../utils/Errors';
import ChangePassword from './ChangePassword';
import PageMenu from '../utils/PageMenu';

class User extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            confirmOpen: false,
        };
        this.saveUser = this.saveUser.bind(this);
    }

    getUserEmail = () => {
        const { user } = this.props;
        return user.emails[0].address;
    };

    methodCallback = () => wrapMeteorCallback((err) => {
        if (!err) browserHistory.goBack();
    });

    saveUser = (user) => {
        if (user._id) {
            Meteor.call('user.update', user, this.methodCallback());
        } else {
            const { sendEmail } = user;
            Meteor.call('user.create', user, !!sendEmail, this.methodCallback());
        }
    };

    removeUser = userId => Meteor.call('user.remove', userId, this.methodCallback());

    getPanes = () => {
        const { confirmOpen } = this.state;
        const { user } = this.props;
        const panes = [
            {
                menuItem: 'General information',
                render: () => (
                    <Segment>
                        <AutoForm
                            schema={UserEditSchema}
                            onSubmit={usr => this.saveUser(usr)}
                            model={user}
                            modelTransform={(mode, model) => {
                                const usr = cloneDeep(model);
                                if (['validate', 'submit'].includes(mode)) {
                                    usr.email = model.emails[0].address.trim().toLowerCase();
                                }
                                return usr;
                            }}
                        >
                            <AutoField name='emails.0.address' />
                            <AutoField name='emails.0.verified' />
                            <AutoField name='profile.firstName' />
                            <AutoField name='profile.lastName' />
                            <ErrorsField />
                            <SubmitField />
                        </AutoForm>
                    </Segment>
                ),
            },
            {
                menuItem: 'Password change',
                render: () => (
                    <Segment>
                        <ChangePassword userId={user._id} />
                    </Segment>
                ),
            },
        ];

        if (can('global-admin')) {
            panes.push({
                menuItem: 'User deletion',
                render: () => (
                    <Segment>
                        <Header content='Delete user' />
                        <br />
                        <Button
                            icon='trash'
                            negative
                            content='Delete user'
                            onClick={() => this.setState({ confirmOpen: true })}
                        />
                        <Confirm
                            open={confirmOpen}
                            header={`Delete user ${this.getUserEmail()}`}
                            content='This cannot be undone!'
                            onCancel={() => this.setState({ confirmOpen: false })}
                            onConfirm={() => this.removeUser(user._id)}
                        />
                    </Segment>
                ),
            });
        }

        return panes;
    };

    render() {
        // noinspection JSAnnotator
        const { user, ready } = this.props;
        return (
            <>
                <PageMenu icon='users' title={!!user ? 'Edit user' : 'New user'} />
                {ready && (
                    <Container>
                        {!!user ? (
                            <div>
                                <Tab
                                    menu={{ secondary: true, pointing: true }}
                                    panes={this.getPanes()}
                                />
                                {/* <Segment>
                                    <SetPermissions user={user} saveUser={this.saveUser} projects={projects} />
                                </Segment> */}
                            </div>
                        ) : (
                            <Segment>
                                <AutoForm schema={UserCreateSchema} onSubmit={this.saveUser}>
                                    <AutoField name='profile.firstName' />
                                    <AutoField name='profile.lastName' />
                                    <AutoField name='email' />
                                    <AutoField name='sendEmail' />
                                    <ErrorsField />
                                    <SubmitField label='Create user' className='primary' />
                                </AutoForm>
                            </Segment>
                        )}
                    </Container>
                )}
            </>
        );
    }
}

User.defaultProps = {
    user: null,
};

User.propTypes = {
    user: PropTypes.object,
    ready: PropTypes.bool.isRequired,
    projectOptions: PropTypes.array.isRequired,
};

const UserContainer = withTracker(({ params }) => {
    const userDataHandler = Meteor.subscribe('userData');
    const projectsHandler = Meteor.subscribe('projects.names');
    const ready = [userDataHandler, projectsHandler].every(h => h.ready());
    const user = Meteor.users.findOne({ _id: params.user_id });


    return {
        ready,
        user,
    };
})(User);

export default UserContainer;
