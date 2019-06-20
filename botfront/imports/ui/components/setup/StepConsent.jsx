import React from 'react';
import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';

// eslint-disable-next-line react/prefer-stateless-function
class StepConsentComponent extends React.Component {
    render() {
        const { onSubmit } = this.props;
        return (
            <>
                <br />
                <br />
                <span className='step-text'>
                    Do you want to be notified of new releases ?
                </span>
                <br />
                <br />
                <br />
                <span className='legal-text'>
                    Privacy notice: your email address, first and last names will be transferred to Mailchimp. See their
                    <br />
                    <a
                        href='https://mailchimp.com/legal/'
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        privacy practices here.
                    </a>
                </span>
                <br />
                <br />
                <br />
                <div style={{ textAlign: 'center' }}>
                    <Button
                        data-cy='email-consent'
                        content='Yes, Finish'
                        primary
                        size='small'
                        onClick={() => onSubmit(true)}
                    />
                    <Button
                        data-cy='email-refuse'
                        basic
                        size='small'
                        content='Maybe later'
                        onClick={() => onSubmit(false)}
                    />
                </div>
            </>
        );
    }
}

StepConsentComponent.propTypes = {
    onSubmit: PropTypes.func.isRequired,
};

export default StepConsentComponent;
