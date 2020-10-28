import {
    AutoField,
    AutoForm, ErrorsField,
} from 'uniforms-semantic';
import 'react-select/dist/react-select.css';
import { Tab } from 'semantic-ui-react';
import SimpleSchema from 'simpl-schema';
import PropTypes from 'prop-types';
import React from 'react';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';

import { wrapMeteorCallback } from '../../../utils/Errors';
import ChangesSaved from '../../../utils/ChangesSaved';
import AceField from '../../../utils/AceField';
import SaveButton from '../../../utils/SaveButton';
import { Can, can } from '../../../../../lib/scopes';

export default class NLUPipeline extends React.Component {
    constructor(props) {
        super(props);
        this.state = { saved: false, showConfirmation: false };
        this.schema = {
            config: { type: String },
            hasNoWhitespace: { type: Boolean, optional: true },
            instance: { type: String, optional: true },
        };
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

    sparseModel() {
        const { model } = this.props;
        const sparseModel = {};
        Object.keys(this.schema).forEach((k) => {
            sparseModel[k] = model[k];
        });
        return sparseModel;
    }

    render() {
        const { saved, showConfirmation } = this.state;
        const { projectId } = this.props;
        return (
            <Tab.Pane>
                <AutoForm schema={new SimpleSchema2Bridge(new SimpleSchema(this.schema))} model={this.sparseModel()} onSubmit={this.handleSave}>
                    <AceField name='config' label='NLU Pipeline' readOnly={!can('nlu-data:x', projectId)} />
                    <AutoField name='hasNoWhitespace' label='Enable non-whitespace language mode' data-cy='whitespace-option' />
                    <ErrorsField />
                    {showConfirmation && (
                        <ChangesSaved
                            onDismiss={() => this.setState({ showConfirmation: false, saved: false })
                            }
                            content={(
                                <p>
                                    You need to <b>re-train</b> your model to deploy them
                                </p>
                            )}
                        />
                    )}
                    <Can I='nlu-data:x' projectId={projectId}>
                        <SaveButton saved={saved} />
                    </Can>
                </AutoForm>
            </Tab.Pane>
        );
    }
}

NLUPipeline.propTypes = {
    model: PropTypes.object.isRequired,
    projectId: PropTypes.string.isRequired,
};
