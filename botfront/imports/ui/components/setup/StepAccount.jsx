import React from 'react';

import {
    AutoForm, AutoField, ErrorsField, SubmitField,
} from 'uniforms-semantic';
import PropTypes from 'prop-types';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { accountSetupSchema } from '../../../api/setup';

// eslint-disable-next-line react/prefer-stateless-function
class StepAccountComponent extends React.Component {
    render() {
        const { onSubmit, data } = this.props;
        const bridge = new SimpleSchema2Bridge(accountSetupSchema);
        return (
            <AutoForm model={data} schema={bridge} onSubmit={onSubmit}>
                <AutoField name='firstName' placeholder='Your first name' label={null} />
                <AutoField name='lastName' placeholder='Your last name' label={null} />
                <AutoField name='email' placeholder='Your email' label={null} />
                <AutoField
                    name='password'
                    placeholder='Choose a password'
                    label={null}
                    type='password'
                />
                <AutoField
                    name='passwordVerify'
                    placeholder='Confirm your password'
                    label={null}
                    type='password'
                />
                <br />
                <ErrorsField />
                <div style={{ textAlign: 'center' }}>
                    <SubmitField
                        data-cy='account-create-button'
                        value='Continue'
                        className='primary'
                    />
                </div>
            </AutoForm>
        );
    }
}

StepAccountComponent.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    data: PropTypes.object,
};

StepAccountComponent.defaultProps = {
    data: undefined,
};

export default StepAccountComponent;
