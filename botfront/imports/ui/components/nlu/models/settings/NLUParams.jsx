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
        const { model, instances } = this.props;
        const { saved, showConfirmation } = this.state;
        return (
            <Tab.Pane>
                <AutoForm schema={NLUModelSchema} model={model} onSubmit={m => this.handleSave(m)}>
                    <AutoField name='name' />
                    <SelectLanguage name='language' />
                    <AutoField name='description' />
                    <SelectInstanceField
                        name='instance'
                        label='NLU Instance'
                        instances={instances}
                    />
                    <ErrorsField />
                    {showConfirmation && (
                        <ChangesSaved
                            dismissable
                            onDismiss={() => this.setState({ showConfirmation: false, saved: false })}
                        />
                    )}
                    <SaveButton saved={saved} />
                </AutoForm>
            </Tab.Pane>
        );
    }
}

NLUParams.propTypes = {
    model: PropTypes.object.isRequired,
    instances: PropTypes.array.isRequired,
};

export default NLUParams;
