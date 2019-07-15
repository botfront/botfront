import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import {
    Dropdown, Button, Modal, Search,
} from 'semantic-ui-react';
import './style.less';
import Context from './Context';

const BotResponsePopupContent = (props) => {
    const {
        onSelect, onCreate, trigger,
    } = props;
    const { responses } = useContext(Context);
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <>
            <Modal
                size='tiny'
                open={modalOpen}
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
                    <Dropdown.Header style={{ margin: '0.6em' }}>Select from existing</Dropdown.Header>
                    <Dropdown.Item>
                        <Search fluid onClick={() => setModalOpen(true)} />
                    </Dropdown.Item>
                    <Dropdown.Divider style={{ margin: '0' }} />
                    <Dropdown.Header style={{ margin: '0.6em' }}>Or use a template</Dropdown.Header>
                    <Dropdown.Item onClick={() => onCreate('text')}>Text</Dropdown.Item>
                    <Dropdown.Item onClick={() => onCreate('qr')}>Text with buttons (Quick reply)</Dropdown.Item>
                    <Dropdown.Item onClick={() => onCreate('image')}>Image</Dropdown.Item>
                    <Dropdown.Item onClick={() => onCreate('video')}>Video</Dropdown.Item>
                    <Dropdown.Item onClick={() => onCreate('carousel')}>Carousel</Dropdown.Item>
                    <Dropdown.Item onClick={() => onCreate('button')}>Button template</Dropdown.Item>
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
};

BotResponsePopupContent.defaultProps = {
    value: null,
    onSelect: () => {},
    onCreate: () => {},
};

export default BotResponsePopupContent;
