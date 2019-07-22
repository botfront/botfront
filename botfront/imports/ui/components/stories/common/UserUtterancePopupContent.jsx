import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Dropdown, Modal, Button,
} from 'semantic-ui-react';
import PayloadEditor from './PayloadEditor';

const UserUtterancePopupContent = (props) => {
    const {
        onCreateFromPayload, onCreateFromInput, trigger,
    } = props;
    const [modalOpen, setModalOpen] = useState(false);
    const [payload, setPayload] = useState({ intent: null, entities: [] });

    const payloadValid = () => {
        if (!payload.intent) return false;
        if (payload.entities.length
            && payload.entities.some(e => !e.entity || !e.entityValue || e.entityValue.trim() === '')) return false;
        return true;
    };

    return (
        <>
            <Modal
                size='tiny'
                open={modalOpen}
                onClose={() => { setModalOpen(false); onCreateFromPayload(payload); }}
            >
                <Modal.Content>
                    <PayloadEditor onChange={setPayload} value={payload} />
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        content='Save'
                        color='green'
                        disabled={!payloadValid()}
                        onClick={(e) => {
                            e.preventDefault();
                            setModalOpen(false);
                            onCreateFromPayload(payload);
                        }}
                    />
                    <Button
                        content='Cancel'
                        color='red'
                        basic
                        onClick={(e) => { e.preventDefault(); setModalOpen(false); }}
                    />
                </Modal.Actions>
            </Modal>
            <Dropdown trigger={trigger} className='dropdown-button-trigger'>
                <Dropdown.Menu style={{ top: 'calc(100% + 5px)' }}>
                    <Dropdown.Item onClick={() => setModalOpen(true)}>From payload</Dropdown.Item>
                    <Dropdown.Item onClick={() => onCreateFromInput()}>From input</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </>
    );
};

UserUtterancePopupContent.propTypes = {
    onCreateFromPayload: PropTypes.func,
    onCreateFromInput: PropTypes.func,
};

UserUtterancePopupContent.defaultProps = {
    onCreateFromPayload: () => {},
    onCreateFromInput: () => {},
};

export default UserUtterancePopupContent;
