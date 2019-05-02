import React from 'react';
import {
    AutoForm, AutoField, ErrorsField, SubmitField,
} from 'uniforms-semantic';
import PropTypes from 'prop-types';
import SelectField from '../nlu/common/SelectLanguage';
import { newProjectSchema } from '../../../api/setup';

// eslint-disable-next-line react/prefer-stateless-function
class StepProjectComponent extends React.Component {
    render() {
        const { onSubmit, data } = this.props;
        return (
            <AutoForm model={data} schema={newProjectSchema} onSubmit={onSubmit}>
                <br />
                <AutoField
                    name='project'
                    placeholder='Choose a name for your first project (you can change it later)'
                    label={null}
                />
                <SelectField name='language' label={null} placeholder='Select the default language of your project' />
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
