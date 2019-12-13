import React from 'react';
import {
    AutoForm, HiddenField, ErrorsField, SubmitField,
} from 'uniforms-semantic';
import PropTypes from 'prop-types';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import SelectField from '../nlu/common/SelectLanguage';
import { newProjectSchema } from '../../../api/setup';

// eslint-disable-next-line react/prefer-stateless-function
class StepProjectComponent extends React.Component {
    render() {
        const { onSubmit, data } = this.props;
        const bridge = new SimpleSchema2Bridge(newProjectSchema);
        return (
            <AutoForm model={data} schema={bridge} onSubmit={onSubmit}>
                <br />
                <span className='step-text'>
                    What is the default language of your project?
                </span>
                <br />
                <br />
                <HiddenField
                    name='project'
                    value='My Project'
                />
                <SelectField
                    label={null}
                    name='language'
                    placeholder='Select the default language of your project'
                />
                <br />
                <ErrorsField />
                <div style={{ textAlign: 'center' }}>
                    <SubmitField
                        data-cy='project-create-button'
                        value='Continue'
                        className='primary'
                    />
                </div>
            </AutoForm>
        );
    }
}

StepProjectComponent.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    data: PropTypes.object,
};

StepProjectComponent.defaultProps = {
    data: undefined,
};

export default StepProjectComponent;
