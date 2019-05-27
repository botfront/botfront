
import PropTypes from 'prop-types';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import 'react-s-alert/dist/s-alert-default.css';
import { AutoForm, ErrorsField, SubmitField } from 'uniforms-semantic';
import { cloneDeep } from 'lodash';
import { RulesSchema, Rules as RulesCollection } from '../../../api/rules';
import AceField from '../utils/AceField';
import { wrapMeteorCallback } from '../utils/Errors';
import { can } from '../../../lib/scopes';

class Rules extends React.Component {
    constructor(props) {
        super(props);
        this.state = { saving: false };
    }

    onSave = (rules) => {
        this.setState({ saving: true });
        Meteor.call('rules.save', rules, wrapMeteorCallback(() => this.setState({ saving: false }), 'Rules saved'));
    };

    disableAutoForm = (permission, saving) => {
        if (saving) {
            return true;
        }
        if (permission) {
            return false;
        }
        return true;
    }

    renderRules = (saving, rules, projectId) => (
        <AutoForm
            disabled={this.disableAutoForm(can('project-settings:w', projectId), saving)}
            schema={RulesSchema}
            model={rules}
            onSubmit={this.onSave}
            modelTransform={(mode, model) => {
                const newModel = cloneDeep(model);
                if (mode === 'validate' || mode === 'submit') {
                    // eslint-disable-next-line no-param-reassign
                    newModel.projectId = projectId;
                }
                return newModel;
            }}
        >
            <AceField name='rules' label='Rules' fontSize={12} data-cy='ace-field' />
            <ErrorsField />
            <SubmitField data-cy='save-button' value='Save' className='primary' />
        </AutoForm>
    );

    renderLoading = () => <div />;

    render() {
        const { projectId, rules, ready } = this.props;
        const { saving } = this.state;
        if (ready) return this.renderRules(saving, rules, projectId);
        return this.renderLoading();
    }
}

Rules.propTypes = {
    projectId: PropTypes.string.isRequired,
    rules: PropTypes.object,
    ready: PropTypes.bool.isRequired,
};

Rules.defaultProps = {
    rules: {},
};

const RulesContainer = withTracker(({ projectId }) => {
    const handler = Meteor.subscribe('rules', projectId);
    const rules = RulesCollection.findOne({ projectId });

    return {
        ready: handler.ready(),
        rules,
    };
})(Rules);

const mapStateToProps = state => ({
    projectId: state.get('projectId'),
});

export default connect(mapStateToProps)(RulesContainer);
