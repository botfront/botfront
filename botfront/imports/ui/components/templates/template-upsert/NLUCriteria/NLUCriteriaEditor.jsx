import React from 'react';
import PropTypes from 'prop-types';
import { uniq } from 'lodash';
import { withTracker } from 'meteor/react-meteor-data';
import {
    Icon, Label, Popup, Container,
} from 'semantic-ui-react';
import { Projects } from '../../../../../api/project/project.collection';
import { NLUModels as NLUModelsCollection } from '../../../../../api/nlu_model/nlu_model.collection';
import NLUCriteria from './NLUCriteria';
import './NLUCriteriaEditor.less';
import { isEntityValid } from '../../../../../lib/utils';

class NLUCriteriaEditor extends React.Component {
    handleNLUCriteriaChange = (index, e) => {
        const {
            onChange,
            value: { nlu = [{ intent: '', entities: [] }] },
        } = this.props;
        onChange({
            nlu: nlu.map((criteria, criteriaIndex) => {
                if (criteriaIndex === index) {
                    return e;
                }
                return criteria;
            }),
        });
    };

    handleAddNLUCriteria = () => {
        const {
            onChange,
            value: { nlu = [{ intent: '', entities: [] }] },
        } = this.props;
        onChange({
            nlu: nlu.concat([{ intent: '', entities: [] }]),
        });
    };

    handleRemoveCriteria = (index) => {
        const { onChange, value } = this.props;
        onChange({
            nlu: [...value.nlu.slice(0, index), ...value.nlu.slice(index + 1)],
        });
    };

    render() {
        const { intents, entities, value: { nlu = [{ intent: '', entities: [] }] } = {}, ready } = this.props;
        const NLUCriterias = nlu;
        const shouldShowAddConditionButton = NLUCriterias.every(criteria => criteria.intent && criteria.entities.every(isEntityValid));
        return (
            <div className='nlu-criteria-editor'>
                <br />

                {NLUCriterias.map((criteria, index) => (
                    <div key={index} id={`nlu-criterium-${index}`}>
                        <NLUCriteria
                            criteriumIndex={index}
                            intents={intents}
                            entities={entities}
                            selectedIntent={criteria.intent}
                            selectedEntities={criteria.entities}
                            onChange={e => this.handleNLUCriteriaChange(index, e)}
                            onRemove={() => this.handleRemoveCriteria(index)}
                            deleteButton={index > 0}
                            ready={ready}
                        />
                        {index !== NLUCriterias.length - 1 && (
                            <Container textAlign='center' className='condition-separator'>
                                <Label content='OR' color='teal' basic />
                            </Container>
                        )}
                    </div>
                ))}
                {/* There we check that every criteria is valid before
                displaying the button to add a criteria */}
                { shouldShowAddConditionButton && (
                    <Container textAlign='center' className='condition-separator'>
                        <Popup
                            trigger={(
                                <Icon
                                    className='add-criterium-ellipsis'
                                    name='ellipsis horizontal'
                                    link
                                    onClick={this.handleAddNLUCriteria}
                                    size='large'
                                />
                            )}
                            content='Add an alternate condition'
                        />
                    </Container>
                )}
            </div>
        );
    }
}

NLUCriteriaEditor.propTypes = {
    onChange: PropTypes.func.isRequired,
    // This prop is actually used in the meteor data binding
    // eslint-disable-next-line react/no-unused-prop-types
    projectId: PropTypes.string.isRequired,
    intents: PropTypes.array,
    entities: PropTypes.array,
    value: PropTypes.object.isRequired,
    ready: PropTypes.bool.isRequired,
};

NLUCriteriaEditor.defaultProps = {
    intents: [],
    entities: [],
};

const NLUCriteriaEditorDataLoader = withTracker((props) => {
    const { projectId } = props;
    const modelsHandler = Meteor.subscribe('nlu_models.project.training_data', projectId);
    const modelIds = Projects.findOne({ _id: projectId }, { fields: { nlu_models: 1 } }).nlu_models;
    const models = NLUModelsCollection.find({ _id: { $in: modelIds } }, { fields: { 'training_data.common_examples': 1 } }).fetch();

    let intents = [];
    let entities = [];
    const ready = modelsHandler.ready();
    if (ready) {
        models.forEach((model) => {
            intents.push(...model.training_data.common_examples.map(e => e.intent));
            model.training_data.common_examples.forEach((e) => {
                if (e.entities) {
                    e.entities.forEach((entity) => {
                        entities.push(entity.entity);
                    });
                }
            });
        });
        intents = uniq(intents).sort();
        entities = uniq(entities).sort();
    }

    return {
        intents,
        entities,
        ready,
    };
})(NLUCriteriaEditor);

export default NLUCriteriaEditorDataLoader;
