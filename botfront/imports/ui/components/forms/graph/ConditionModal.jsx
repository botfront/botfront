import {
    Query, Builder, Utils as QbUtils,
} from 'react-awesome-query-builder';
import React, {
    useState, useContext, useEffect, useMemo,
} from 'react';
import {
    Modal, Button, Popup, Icon,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';

import 'react-awesome-query-builder/lib/css/styles.css';

import { ProjectContext } from '../../../layouts/context';
import { GraphContext } from './graph.utils';
import { QbConfig } from '../../../../lib/pypred/ConditionModal.config';
import ConfirmPopup from '../../common/ConfirmPopup';
import { defaultSlotField } from '../../../../lib/pypred/pypred.utils';


// You can load query value from your backend storage (for saving see `Query.onChange()`)
const queryValue = { id: QbUtils.uuid(), type: 'group' };
export default function ConditionModal(props) {
    const {
        onClose, condition,
    } = props;

    const [tree, setTree] = useState(QbUtils.checkTree(QbUtils.loadTree(condition || queryValue), QbConfig));
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const { elements } = useContext(GraphContext);
    const { slots } = useContext(ProjectContext);

    // useEffect does not seem to work there as it doesn't update the fields in time.
    useMemo(() => {
        const elementsSlots = elements.reduce((acc, val) => {
            if (val.type === 'slot') return [...acc, val.id];
            return acc;
        }, []);

        let fields = elementsSlots.reduce((acc, slotName) => ({
            ...acc,
            [slotName]: {
                ...defaultSlotField,
                label: slotName,
            },
        }), {});

        fields = slots.reduce((acc, slot) => ({
            ...acc,
            [slot.name]: {
                ...defaultSlotField,
                label: slot.name,
            },
        }), fields);

        QbConfig.fields = fields;
    }, [slots, elements]);

    useEffect(() => {
        setTree(QbUtils.checkTree(QbUtils.loadTree(condition || queryValue), QbConfig));
    }, [condition]);

    const onChange = (immutableTree) => {
        // Tip: for better performance you can apply `throttle` - see `examples/demo`
        setTree(QbUtils.checkTree(immutableTree, QbConfig));
    };

    const deleteAll = () => {
        onClose(null, '');
    };

    const renderBuilder = builderProps => (
        <div className='query-builder-container'>
            <div className='query-builder qb-lite'>
                <Builder {...builderProps} />
            </div>
        </div>
    );

    const render = () => (
        <div>
            <Query
                {...QbConfig}
                value={tree}
                onChange={onChange}
                renderBuilder={renderBuilder}
            />
        </div>
    );
    return (
        <Modal open onClose={() => onClose(QbUtils.getTree(tree))} className='slot-condition-modal' data-cy='condition-modal'>
            <Modal.Header>Conditions needed to get to the next response</Modal.Header>
            <Modal.Content>
                Use the space below to create your condition.
                {render()}
                <div className='condition-bottom-options'>
                    <Popup
                        content={(
                            <ConfirmPopup
                                negative
                                title='Are you sure?'
                                description='All the conditions for this slot will be permanently deleted.'
                                onYes={() => {
                                    setConfirmDeleteOpen(false);
                                    deleteAll();
                                }}
                                onNo={() => setConfirmDeleteOpen(false)}
                            />
                        )}
                        open={confirmDeleteOpen}
                        trigger={(
                            <Button
                                basic
                                negative
                                floated='right'
                                onClick={() => setConfirmDeleteOpen(true)}
                            >
                                <Icon name='trash' />
                                Delete all Conditions
                            </Button>
                        )}
                    />
                    
                </div>
            </Modal.Content>
        </Modal>
    );
}

ConditionModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    condition: PropTypes.object,
};

ConditionModal.defaultProps = {
    condition: null,
};
