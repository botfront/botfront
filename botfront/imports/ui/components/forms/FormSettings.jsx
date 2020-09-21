import React, {
    useState, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { GraphQLBridge } from 'uniforms-bridge-graphql';
import {
    AutoForm,
    LongTextField,
} from 'uniforms-semantic';
import { buildASTSchema, parse } from 'graphql';
import {
    Popup, Checkbox, Icon, Header, Container,
} from 'semantic-ui-react';

import { can } from '../../../lib/scopes';
import ToggleField from '../common/ToggleField';
import { clearTypenameField } from '../../../lib/client.safe.utils';
import { useMethod } from '../utils/hooks.js';

const CreateForm = (props) => {
    const {
        initialModel,
        onSubmit,
        projectId,
    } = props;

    const { data: allowContextualQuestionsDB, call: getAllowContextualQuestions } = useMethod('project.checkAllowContextualQuestions');
    const { call: setAllowContextualQuestionsInDb } = useMethod('project.setAllowContextualQuestions');
    const [allowContextualQuestions, setAllowContextualQuestions] = useState(null);

    useEffect(() => {
        getAllowContextualQuestions(projectId);
    }, []);

    const getFormattedModel = () => (clearTypenameField({
        ...initialModel,
        description: initialModel.description || '',
        slotNames: (initialModel.slots || []).map(({ name }) => name),
    }));

    const schemaString = `
        type NewForm {
            name: String!
            description: String
            collect_in_botfront: Boolean
        }
    `;

    const schema = buildASTSchema(parse(`${schemaString}
    `)).getType('NewForm');

    const handleSubmit = (incomingModel) => {
        const model = { ...incomingModel };
        if (allowContextualQuestions !== null) {
            setAllowContextualQuestionsInDb(projectId, allowContextualQuestions);
        }
        delete model.slotNames;
        onSubmit(model);
    };


    const validator = () => {
        const errors = [];
        if (errors.length) {
            // eslint-disable-next-line no-throw-literal
            throw { details: errors };
        }
    };

    return (
        <div>
            <Header className='graph-sidebar-header' secondary size='small'>Form settings</Header>
            <AutoForm autosave model={getFormattedModel()} schema={new GraphQLBridge(schema, validator, {})} onSubmit={handleSubmit} disabled={!can('stories:w', projectId)}>
                <Container>
                    <LongTextField name='description' className='create-form-field' data-cy='form-description-field' />
                    <Checkbox
                    // we force it to boolean so that the value is never null
                    // This way, it's always a controlled component.
                        checked={!!(allowContextualQuestions !== null ? allowContextualQuestions : allowContextualQuestionsDB)}
                        label='Allow contextual side questions'
                        toggle
                        onChange={() => {
                            if (allowContextualQuestions !== null) {
                                setAllowContextualQuestions(!allowContextualQuestions);
                            } else {
                                setAllowContextualQuestions(!allowContextualQuestionsDB);
                            }
                        }}
                        className='contextual-side-questions'
                        data-cy='side-questions'
                    />
                    <Popup
                        size='small'
                        inverted
                        content='This will enable contextual side questions in all forms and may increase training time. This setting also requires TEDPolicy in your policies'
                        trigger={<Icon name='question' circular inverted color='grey' className='side-question-tooltips' />}
                    />
                    <ToggleField name='collect_in_botfront' data-cy='form-collection-togglefield' />
                </Container>
            </AutoForm>
        </div>
    );
};

CreateForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    initialModel: PropTypes.object,
    projectId: PropTypes.string.isRequired,
};

CreateForm.defaultProps = {
    initialModel: {},
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(CreateForm);
