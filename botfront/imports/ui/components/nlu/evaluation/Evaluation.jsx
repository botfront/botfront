import React from 'react';
import PropTypes from 'prop-types';
import Alert from 'react-s-alert';

import requiredIf from 'react-required-if';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import {
    Button,
    Form,
    Icon,
    Message,
    Tab,
} from 'semantic-ui-react';
import { activityQuery } from '../activity/queries';
import apolloClient from '../../../../startup/client/apollo';

import IntentReport from './IntentReport';
import EntityReport from './EntityReport';
import ExampleUtils from '../../utils/ExampleUtils';
import { InputButtons } from './InputButtons.jsx';
import { Evaluations } from '../../../../api/nlu_evaluation';
import UploadDropzone from '../../utils/UploadDropzone';
import { Loading } from '../../utils/Utils';

import 'react-select/dist/react-select.css';


class Evaluation extends React.Component {
    constructor(props) {
        super(props);
        const { evaluation, initialState, validationRender } = props;

        let defaultSelection = 0;
        if (validationRender()) defaultSelection = 2;

        this.state = {
            evaluation,
            data: null,
            loading: false,
            evaluating: false,
            exampleSet: 'train',
            errorMessage: null,
            selectedIndex: defaultSelection,
            ...initialState,
        };

        this.evaluate = this.evaluate.bind(this);
        this.loadData = this.loadData.bind(this);
    }

    componentWillReceiveProps(props) {
        const { evaluation } = props;
        this.setState({ evaluation });
    }

    getPrimaryPanes() {
        const {
            evaluation: {
                results: {
                    intent_evaluation: intentEvaluation,
                    entity_evaluation: entityEvaluation,
                } = {},
            } = {},
        } = this.state;

        const menuItems = [];
        if (intentEvaluation) {
            menuItems.push({
                menuItem: 'Intents',
                render: () => <IntentReport {...intentEvaluation} />,
            });
        }
        if (entityEvaluation) {
            menuItems.push({
                menuItem: 'Entities',
                render: () => <EntityReport {...entityEvaluation} />,
            });
        }

        return menuItems;
    }

    evaluate() {
        this.setState({ evaluating: true });
        const {
            projectId,
            model: {
                _id: modelId,
            } = {},
        } = this.props;

        const { data } = this.state;

        Meteor.call('rasa.evaluate.nlu', modelId, projectId, data, (err) => {
            this.setState({ evaluating: false });
            if (err) {
                Alert.error(`Error: ${JSON.stringify(err.reason)}`, {
                    position: 'top-right',
                    timeout: 'none',
                });
            }
        });
    }

    useTestSet() {
        this.changeExampleSet('test', true);
    }

    useTrainingSet() {
        this.changeExampleSet('train');
    }

    async useValidatedSet() {
        this.changeExampleSet('validation', true);
        const { model: { _id: modelId } = {} } = this.props;
        const { data: { getActivity: { activity: examples } } } = await apolloClient.query({
            query: activityQuery,
            variables: { modelId, validated: true, pageSize: 0 },
        });
        const validExamples = examples.filter(({ validated }) => validated)
            .map(example => ExampleUtils.stripBare(example, false));
        // Check that there are nonzero validated examples
        if (validExamples.length > 0) {
            this.setState({
                data: { rasa_nlu_data: { common_examples: validExamples, entity_synonyms: [], gazette: [] } },
                loading: false,
            });
        } else {
            const message = (
                <Message warning>
                    <Message.Header>No validated examples</Message.Header>
                    <p>See the activity section to manage incoming traffic to this model</p>
                </Message>
            );
            this.setState({ errorMessage: message, loading: false });
        }
    }

    changeExampleSet(exampleSet, loading = false) {
        this.setState({
            exampleSet,
            loading,
            data: null,
            errorMessage: null,
        });
    }

    loadData(data) {
        const { loading } = this.state;
        try {
            const parsed = JSON.parse(data);
            if (loading) this.setState({ data: parsed, loading: false });
        } catch (e) {
            Alert.error('Error: you must upload a JSON file with the same format as an export', {
                position: 'top',
                timeout: 'none',
            });
        }
    }

    render() {
        const {
            validationRender,
            evaluation,
            loading: reportLoading,
        } = this.props;

        const {
            data,
            exampleSet,
            errorMessage,
            evaluating,
            loading: dataLoading,
            selectedIndex,
        } = this.state;

        let defaultSelection = 0;
        if (validationRender()) {
            defaultSelection = 2;
        }

        return (
            <Tab.Pane textAlign='center'>
                <Loading loading={reportLoading}>
                    {errorMessage}
                    <br />
                    <Form>
                        <div id='test_set_buttons'>
                            <InputButtons
                                labels={['Use training set', 'Upload test set', 'Use validated examples']}
                                operations={[this.useTrainingSet.bind(this), this.useTestSet.bind(this), this.useValidatedSet.bind(this)]}
                                defaultSelection={defaultSelection}
                                onDefaultLoad={defaultSelection === 2 ? this.evaluate : () => {}}
                                selectedIndex={selectedIndex}
                            />
                        </div>
                        {exampleSet === 'test' && <UploadDropzone success={!!data} onDropped={this.loadData} binary={false} />}
                        {!dataLoading && !errorMessage && (
                            <div>
                                <Button type='submit' basic fluid color='green' loading={evaluating} onClick={this.evaluate} data-cy='start-evaluation'>
                                    <Icon name='percent' />
                                    Start evaluation
                                </Button>
                                <br />
                            </div>
                        )}

                        {!!evaluation && !evaluating && (
                            <Tab menu={{ pointing: true, secondary: true }} panes={this.getPrimaryPanes()} />
                        )}
                    </Form>
                </Loading>
            </Tab.Pane>
        );
    }
}

Evaluation.propTypes = {
    model: PropTypes.object.isRequired,
    evaluation: requiredIf(PropTypes.object, props => !props.loading),
    projectId: PropTypes.string.isRequired,
    loading: PropTypes.bool.isRequired,
    validationRender: PropTypes.func,
    initialState: PropTypes.object,
};

Evaluation.defaultProps = {
    validationRender: () => false,
    evaluation: undefined,
    initialState: {},
};

const EvaluationContainer = withTracker((props) => {
    const {
        model,
        model: {
            _id: modelId,
        } = {},
        projectId,
        validationRender,
    } = props;

    const evalsHandler = Meteor.subscribe('nlu_evaluations', props.model._id);
    const loading = !evalsHandler.ready();
    const evaluation = Evaluations.findOne({ modelId });
    return {
        model,
        projectId,
        validationRender,
        evaluation,
        loading,
    };
})(Evaluation);

export default EvaluationContainer;
