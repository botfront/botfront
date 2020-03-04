import React from 'react';
import { Link } from 'react-router';
import SimpleSchema from 'simpl-schema';
import { Message, Segment } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import {
    AutoForm, ErrorsField, SubmitField, TextField,
} from 'uniforms-semantic';
import { Meteor } from 'meteor/meteor';
import ReCAPTCHA from 'react-google-recaptcha';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import PropTypes from 'prop-types';
import { GlobalSettings } from '../../../api/globalSettings/globalSettings.collection';
import { wrapMeteorCallback } from '../utils/Errors';

class ForgotPassword extends React.Component {
    forgotPasswordFormSchema = new SimpleSchema(
        {
            email: { type: String, regEx: SimpleSchema.RegEx.EmailWithTLD },
        },
        { tracker: Tracker },
    );

    forgotPasswordFormSchemaBridge = new SimpleSchema2Bridge(this.forgotPasswordFormSchema)

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            emailSent: null,
            reCaptcha: null,
        };
    }

    handlePasswordLost = ({ email }) => {
        this.setState({ loading: true });
        Accounts.forgotPassword({ email: email.trim().toLowerCase() }, () => this.setState({ loading: false, emailSent: true }));
    };

    renderForm = (loading, ready, reCatpchaSiteKey, reCaptcha) => {
        const reCaptchaRef = (el) => {
            this.reCaptchaRef = el;
        };
        return (
            <Segment>
                <AutoForm model={{}} schema={this.forgotPasswordFormSchemaBridge} onSubmit={this.handlePasswordLost} className='ui large' disabled={loading}>
                    <TextField name='email' iconLeft='user' placeholder='Email' label={null} />
                    <ErrorsField />
                    {reCatpchaSiteKey && (
                        <div>
                            <ReCAPTCHA sitekey={reCatpchaSiteKey} onChange={this.onCaptcha} ref={reCaptchaRef} />
                            <br />
                        </div>
                    )}
                    <SubmitField value='Continue' className='black large basic fluid' disabled={reCatpchaSiteKey && !reCaptcha} />
                    <br />
                    <Link style={{ color: '#000' }} to='/login'>
                        Back to Sign in
                    </Link>
                </AutoForm>
            </Segment>
        );
    };

    renderSent = () => <Message positive header='Check your email inbox' content='If you have an account with us, you will find the instructions to reset your password in your inbox' />;

    onCaptcha = (reCaptcha) => {
        Meteor.call(
            'user.verifyReCaptcha',
            reCaptcha,
            wrapMeteorCallback((err) => {
                if (!err) return this.setState({ reCaptcha });
                return this.reCaptchaRef.reset();
            }),
        );
    };

    render() {
        const { settings: { settings: { public: { reCatpchaSiteKey } = { reCatpchaSiteKey: null } } = {} } = {}, ready } = this.props;
        const { emailSent: emailAddress, loading, reCaptcha } = this.state;
        return (
            <div>
                {!emailAddress && this.renderForm(loading, ready, reCatpchaSiteKey, reCaptcha)}
                {emailAddress && this.renderSent()}
            </div>
        );
    }
}

ForgotPassword.propTypes = {
    settings: PropTypes.object,
    ready: PropTypes.bool.isRequired,
};

ForgotPassword.defaultProps = {
    settings: {},
};

export default withTracker(() => {
    const settings = GlobalSettings.findOne({}, { fields: { 'settings.public.reCatpchaSiteKey': 1 } });
    return {
        settings,
    };
})(ForgotPassword);
