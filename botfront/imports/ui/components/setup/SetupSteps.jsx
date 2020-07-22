/* eslint-disable no-param-reassign */
import { Container, Segment, Step } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import React from 'react';

import StepAccount from './StepAccount';
import StepProject from './StepProject';
import StepConsent from './StepConsent';
import { wrapMeteorCallback } from '../utils/Errors';

class SetupSteps extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeStep: 'account',
            loading: false,
            accountData: undefined,
            projectData: undefined,
        };
        Meteor.call('users.checkEmpty', (err, empty) => {
            if (!empty) {
                const { router } = this.props;
                router.push('/login');
            }
        });
    }

    handleAccountSubmit = (doc) => {
        doc.firstName = doc.firstName.trim();
        doc.lastName = doc.lastName.trim();
        doc.email = doc.email.trim();
        this.setState({ activeStep: 'project', accountData: doc });
    };

    handleProjectSubmit = (doc) => {
        this.setState({ activeStep: 'consent', projectData: doc });
    };

    handleConsentSubmit = (consent) => {
        this.setState({ loading: true });
        const { accountData, projectData } = this.state;
        const { router } = this.props;
        Meteor.call(
            'initialSetup.firstStep',
            accountData,
            consent,
            wrapMeteorCallback((err) => {
                if (err) throw new Error(err);
                Meteor.loginWithPassword(
                    accountData.email,
                    accountData.password,
                    wrapMeteorCallback(() => {
                        Promise.all([
                            Meteor.callWithPromise('initialSetup.secondStep', projectData),
                            Meteor.callWithPromise('nlu.chitChatSetup'),
                        ])
                            .then((responses) => {
                                router.push(`/project/${responses[0]}/dialogs`);
                            })
                            .catch((e) => {
                                console.log(e);
                                router.push({
                                    pathname: '/admin/projects',
                                    state: {
                                        error:
                                            'Something went wrong with project creation,'
                                            + ' redirecting you to the project selection screen',
                                    },
                                });
                            });
                    }),
                );
            }),
        );
    };

    handleAccountClick = () => {
        this.setState({ activeStep: 'account' });
    };

    handleProjectClick = () => {
        const { activeStep } = this.state;
        if (activeStep === 'consent') {
            this.setState({ activeStep: 'project' });
        }
    };

    render() {
        const {
            activeStep, loading, accountData, projectData,
        } = this.state;
        return (
            <Container>
                <Segment disabled={loading}>
                    <Step.Group fluid ordered size='large'>
                        <Step
                            active={activeStep === 'account'}
                            title='Your account'
                            completed={activeStep !== 'account'}
                            onClick={this.handleAccountClick}
                            data-cy='account-step'
                        />
                        <Step
                            active={activeStep === 'project'}
                            title='Your first project'
                            completed={activeStep === 'consent'}
                            onClick={
                                activeStep === 'consent'
                                    ? () => this.handleProjectClick()
                                    : () => {}
                            }
                            data-cy='project-step'
                        />
                        <Step
                            active={activeStep === 'consent'}
                            title='Updates'
                            data-cy='consent-step'
                        />
                    </Step.Group>
                    {activeStep === 'account' && (
                        <StepAccount onSubmit={this.handleAccountSubmit} data={accountData} />
                    )}
                    {activeStep === 'project' && (
                        <StepProject onSubmit={this.handleProjectSubmit} data={projectData} />
                    )}
                    {activeStep === 'consent' && (
                        <StepConsent onSubmit={this.handleConsentSubmit} />
                    )}
                </Segment>
            </Container>
        );
    }
}

SetupSteps.propTypes = {
    router: PropTypes.object.isRequired,
};

export default SetupSteps;
