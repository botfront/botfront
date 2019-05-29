import { AutoForm, AutoField, ErrorsField } from 'uniforms-semantic';
import { Tab } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';

import { NLUModelSchema } from '../../../../../api/nlu_model/nlu_model.schema';
import { wrapMeteorCallback } from '../../../utils/Errors';
import SelectLanguage from '../../common/SelectLanguage';
import SelectInstanceField from './SelectInstanceField';
import ChangesSaved from '../../../utils/ChangesSaved';
import SaveButton from '../../../utils/SaveButton';
import { can } from '../../../../../lib/scopes';

class NLUParams extends React.Component {
    constructor(props) {
        super(props);
        this.state = { saved: false, showConfirmation: false };
    }

    componentWillUnmount() {
        clearTimeout(this.successTimeout);
    }

    handleSave = (newModel) => {
        const { model } = this.props;
        clearTimeout(this.successTimeout);
        Meteor.call(
            'nlu.update.general',
            model._id,
            newModel,
            wrapMeteorCallback((err) => {
                if (!err) {
                    this.setState({ saved: true, showConfirmation: true });
                    this.successTimeout = setTimeout(() => {
                        this.setState({ saved: false });
                    }, 2 * 1000);
                }
            }),
        );
    };

    render() {
        const { model, instances, projectId } = this.props;
        const { saved, showConfirmation } = this.state;
        const isDisabled = !(can('nlu-model:x', projectId));
        return (
            <Tab.Pane>
                <AutoForm schema={NLUModelSchema} model={model} onSubmit={m => this.handleSave(m)} disabled={isDisabled}>
                    <AutoField name='name' />
                    <SelectLanguage name='language' disable={isDisabled} />
                    <AutoField name='description' />
                    <SelectInstanceField
                        name='instance'
                        label='NLU Instance'
                        instances={instances}
                        disable={isDisabled}
                    />
                    <ErrorsField />
                    {showConfirmation && (
                        <ChangesSaved
                            dismissable
                            onDismiss={() => this.setState({ showConfirmation: false, saved: false })}
                        />
                    )}
                    <SaveButton saved={saved} disabled={isDisabled} />
                </AutoForm>
            </Tab.Pane>
        );
    }
}

NLUParams.propTypes = {
    model: PropTypes.object.isRequired,
    instances: PropTypes.array.isRequired,
    projectId: PropTypes.string.isRequired,
};

export default NLUParams;
