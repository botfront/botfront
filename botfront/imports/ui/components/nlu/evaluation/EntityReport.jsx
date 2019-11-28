import React from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table-v6';
import _ from 'lodash';
import { Message } from 'semantic-ui-react';

import UserUtteranceViewer from '../common/UserUtteranceViewer';
import EntityUtils from '../../utils/EntityUtils';
import { examplePropType } from '../../utils/ExampleUtils';
import { Info } from '../../utils/Utils';
import { Metrics } from './KeyMetrics';

function ExampleTextComparison({ example, prediction }) {
    return (
        <div className='entity_evaluation'>
            <UserUtteranceViewer value={example} color='green' disableEditing />
            <UserUtteranceViewer value={prediction} color='red' disableEditing />
        </div>
    );
}

ExampleTextComparison.propTypes = {
    example: PropTypes.shape(examplePropType).isRequired,
    prediction: PropTypes.shape(examplePropType).isRequired,
    entities: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default class EntityReport extends React.Component {
    static getErrorCode(entity, prediction) {
        if (_.isNull(prediction)) {
            return 3;
        }

        const overlap = EntityReport.getOverlap(entity, prediction);
        if (overlap === 0) {
            return 3;
        }
        if (entity.entity !== prediction.entity) {
            return 2;
        }
        if (entity.start !== prediction.start || entity.end !== prediction.end) {
            return 1;
        }

        return 0;
    }

    static getOverlap(entity1, entity2) {
        let overlap = 0;

        if (entity1.start <= entity2.start) {
            overlap = entity1.end - entity2.start;
        } else {
            overlap = entity2.end - entity1.start;
        }

        // raise to positive number
        if (overlap < 0) {
            overlap = 0;
        }

        return overlap;
    }

    static findClosestEntity(entity, collection) {
        let closest = null;
        let overlap = 0;

        collection.forEach((potential) => {
            const thisOverlap = EntityReport.getOverlap(entity, potential);

            // update closest if more overlap
            if (thisOverlap > overlap) {
                closest = potential;
                overlap = thisOverlap;
            }
        });

        // should be null if no overlapping entity
        return closest;
    }

    constructor(props) {
        super(props);
        this.state = {
            entities: [],
            expanded: {},
        };

        this.errorTypes = ['Correct', 'Overlap', 'Mismatch', 'Not Found'];
        this.errorInfo = [
            'This field measures the portion of entities that were matched correctly, in both position and classification',
            'These errors correspond to a correct classification but slightly incorrect token boundary',
            'These indicate an overlapping token boundary but conflicting classification',
            'Not found indicates either that the entity was missed entirely or appeared in a non-overlapping position in the text',
        ];
        this.errorMessages = ['', 'Incorrect token boundary for this entity', 'Incorrect classification for this entity', 'No corresponding entity in prediction'];
    }

    getEntityData() {
        const statEntities = [];
        const { predictions } = this.props;

        predictions.forEach((p) => {
            if (p.entities) {
                p.entities.forEach((e) => {
                    // Load entities in state for colour matching
                    const { entities } = this.state;
                    const { entity } = e;

                    if (_.indexOf(entities, entity) < 0) {
                        entities.push(entity);
                        this.setState({ entities });
                    }

                    // Load entity stat entry for display
                    if (_.find(statEntities, { entity }) === undefined) {
                        statEntities.push({
                            entity,
                            failed_examples: [],
                            errorCount: [0, 0, 0, 0], // One for each error code (see getErrorCode)
                        });
                    }

                    // The row to modify
                    const statEntity = _.find(statEntities, { entity });

                    const prediction = EntityReport.findClosestEntity(e, p.predicted_entities.filter(EntityUtils.filterDuckling));
                    const errorCode = EntityReport.getErrorCode(e, prediction);

                    statEntity.errorCount[errorCode] += 1;
                    if (errorCode > 0) {
                        // Some error has occurred
                        const intent = p.intent || 'none';
                        const predicted = p.predicted || 'none';
                        const { text } = p;

                        statEntity.failed_examples.push({
                            intent,
                            example: {
                                text,
                                intent,
                                entities: [e],
                            },
                            prediction: {
                                text,
                                intent: predicted,
                                entities: prediction ? [prediction] : [],
                            },
                            errorCode,
                        });
                    }
                });
            }
        });
        return statEntities;
    }

    getFailedExamplesColumns() {
        const { entities } = this.state;
        return [
            {
                id: 'info',
                accessor: () => {},
                Header: '',
                Cell: () => (
                    <div>
                        <p className='overflow with_margin'>Expected: </p>
                        <p className='overflow'>Predicted: </p>
                    </div>
                ),
                width: 80,
            },
            {
                id: 'example',
                accessor: e => e,
                Header: 'Example',
                Cell: e => <ExampleTextComparison example={e.value.example} prediction={e.value.prediction} entities={entities} />,
                className: 'left',
            },
            {
                id: 'error',
                accessor: 'errorCode',
                Header: 'Error Type',
                Cell: errorCode => (
                    <div className='error_text'>
                        <p style={{ display: 'inline', color: 'red' }}>{this.errorTypes[errorCode.value]}</p>
                        {': '}
                        {this.errorMessages[errorCode.value]}
                    </div>
                ),
                width: 200,
                className: 'left',
            },
        ];
    }

    getEntitiesColumns() {
        const columns = [
            {
                id: 'entity',
                accessor: 'entity',
                Header: 'Entity',
                Cell: e => <p>{e.value}</p>,
                className: 'left',
            },
        ];

        this.errorTypes.forEach((errorType, i) => {
            columns.push({
                id: errorType,
                accessor: e => e,
                Header: () => (
                    <div>
                        {`${errorType} `}
                        <Info info={this.errorInfo[i]} />
                    </div>
                ),
                Cell: e => <p>{`${((e.value.errorCount[i] / _.sum(e.value.errorCount)) * 100).toFixed(2)}%`}</p>,
                className: 'right',
                sortMethod: (a, b) => {
                    const aValue = a.errorCount[i] / _.sum(a.errorCount);
                    const bValue = b.errorCount[i] / _.sum(b.errorCount);

                    if (bValue > aValue) {
                        return 1;
                    }
                    if (bValue < aValue) {
                        return -1;
                    }

                    return 0;
                },
                width: 100,
            });
        });

        columns.push({
            id: 'total',
            accessor: e => e,
            Header: 'Total',
            Cell: e => <p>{_.sum(e.value.errorCount)}</p>,
            className: 'right',
            sortMethod: (a, b /* , desc */) => {
                const aValue = _.sum(a.errorCount);
                const bValue = _.sum(b.errorCount);

                if (bValue > aValue) {
                    return 1;
                }
                if (bValue < aValue) {
                    return -1;
                }

                return 0;
            },
            width: 50,
        });

        return columns;
    }

    render() {
        const { expanded } = this.state;
        const data = this.getEntityData();
        const totalErrors = [0, 1, 2, 3].map(i => _.sum(data.map(datum => datum.errorCount[i])));

        if (_.sum(totalErrors) > 0) {
            return (
                <div>
                    <br />
                    <Metrics
                        data={_.zip(this.errorTypes, this.errorInfo, totalErrors).map(([name, info, count]) => ({
                            label: name,
                            value: count / _.sum(totalErrors),
                            help: info,
                        }))}
                    />
                    <br />
                    <br />
                    <ReactTable
                        data={data}
                        columns={this.getEntitiesColumns()}
                        expanded={expanded}
                        onPageChange={(page) => {
                            this.setState({ expanded: {} });
                        }}
                        onExpandedChange={(newExpanded, index) => {
                            if (newExpanded[index[0]] === false) {
                                // eslint-disable-next-line no-param-reassign
                                newExpanded = {};
                            } else {
                                Object.keys(newExpanded).forEach((k) => {
                                    // eslint-disable-next-line no-param-reassign
                                    newExpanded[k] = parseInt(k, 10) === index[0] ? {} : false;
                                });
                            }
                            this.setState({ expanded: newExpanded });
                        }}
                        SubComponent={(row) => {
                            const failureData = row.original.failed_examples;
                            const length = failureData && failureData.length;
                            const pageSize = 5;
                            return length ? (
                                <ReactTable data={failureData} columns={this.getFailedExamplesColumns()} showPagination={length > pageSize} defaultPageSize={length > pageSize ? pageSize : length} />
                            ) : null;
                        }}
                    />
                </div>
            );
        }
        return (
            <Message negative>
                <Message.Header>Nothing to show</Message.Header>
                <p>There are no entities in the evaluation data set that can be shown.</p>
            </Message>
        );
    }
}

EntityReport.propType = {
    predictions: PropTypes.array.isRequired,
    hideEntities: PropTypes.func.isRequired,
};
