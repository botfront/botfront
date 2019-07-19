import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import {
    Dropdown, Modal, Search,
} from 'semantic-ui-react';
import Context from './Context';

const BotResponsePopupContent = (props) => {
    const {
        onSelect, onCreate, trigger, noButtonResponse,
    } = props;
    const { responses } = useContext(Context);
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <>
            <Modal
                size='tiny'
                open={modalOpen}
                onClose={() => setModalOpen(false)}
            >
                <Modal.Header>Select from existing</Modal.Header>
                <Modal.Content>
                    { responses.map(r => (
                        <button
                            type='button'
                            style={{ cursor: 'pointer' }}
                            onClick={(e) => { e.preventDefault(); setModalOpen(false); onSelect(r); }}
                            key={r.name}
                        >
                            {r.name}
                        </button>
                    ))}
                </Modal.Content>
            </Modal>
            <Dropdown trigger={trigger} className='dropdown-button-trigger'>
                <Dropdown.Menu style={{ top: 'calc(100% + 5px)' }}>
                    <Dropdown.Header>Select from existing</Dropdown.Header>
                    <Dropdown.Item>
                        <Search fluid placeholder='Search responses...' onClick={() => setModalOpen(true)} />
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Header>Or use a template</Dropdown.Header>
                    <Dropdown.Item onClick={() => onCreate('text')}>Text</Dropdown.Item>
                    <Dropdown.Item disabled={noButtonResponse} onClick={() => onCreate('qr')}>Text with buttons (Quick reply)</Dropdown.Item>
                    <Dropdown.Item onClick={() => onCreate('image')}>Image</Dropdown.Item>
                    <Dropdown.Item onClick={() => onCreate('video')}>Video</Dropdown.Item>
                    <Dropdown.Item disabled={noButtonResponse} onClick={() => onCreate('carousel')}>Carousel</Dropdown.Item>
                    <Dropdown.Item disabled={noButtonResponse} onClick={() => onCreate('button')}>Button template</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </>
    );
};

BotResponsePopupContent.propTypes = {
    value: PropTypes.string,
    onSelect: PropTypes.func,
    onCreate: PropTypes.func,
    trigger: PropTypes.element.isRequired,
    noButtonResponse: PropTypes.bool,
};

BotResponsePopupContent.defaultProps = {
    value: null,
    noButtonResponse: false,
    onSelect: () => {},
    onCreate: () => {},
};

export default BotResponsePopupContent;
