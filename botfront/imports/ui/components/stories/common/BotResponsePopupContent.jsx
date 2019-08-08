import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Dropdown, Search,
} from 'semantic-ui-react';

const BotResponsePopupContent = (props) => {
    const {
        onCreate, trigger, noButtonResponse, limitedSelection, defaultOpen, onClose, disableExisting,
    } = props;
    const [modalOpen, setModalOpen] = useState(false);
    const [closeNext, setCloseNext] = useState(false);

    useEffect(() => {
        if (closeNext && !modalOpen) onClose();
    }, [closeNext]);

    return (
        <>
            {/* <Modal
                tabIndex={0}
                size='tiny'
                open={modalOpen}
                onClose={() => setModalOpen(false)}
            >
                <Modal.Header>Select from existing</Modal.Header>
                <Modal.Content className='bot-responses-modal'>
                    { responses.map(r => (
                        <button
                            type='button'
                            onClick={(e) => { e.preventDefault(); setModalOpen(false); onSelect(r); }}
                            key={r.name}
                        >
                            {r.name}
                        </button>
                    ))}
                </Modal.Content>
            </Modal> */}
            <Dropdown
                trigger={trigger}
                className='dropdown-button-trigger'
                defaultOpen={defaultOpen}
                onClose={() => setCloseNext(true)}
            >
                <Dropdown.Menu className='first-column'>
                    { !disableExisting
                        ? (
                            <>
                                <Dropdown.Header>Select from existing</Dropdown.Header>
                                <Dropdown.Item onClick={() => setModalOpen(true)}>
                                    <Search fluid placeholder='Search responses...' />
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Header>Or use a template</Dropdown.Header>
                            </>
                        ) : <Dropdown.Header>Use a template</Dropdown.Header>
                    }
                    <Dropdown.Item onClick={() => onCreate('text')}>Text</Dropdown.Item>
                    {!limitedSelection
                        && <>
                            <Dropdown.Item disabled={noButtonResponse} onClick={() => onCreate('qr')}>Text with buttons (Quick reply)</Dropdown.Item>
                            <Dropdown.Item onClick={() => onCreate('image')}>Image</Dropdown.Item>
                            <Dropdown.Item onClick={() => onCreate('video')}>Video</Dropdown.Item>
                            <Dropdown.Item disabled={noButtonResponse} onClick={() => onCreate('carousel')}>Carousel</Dropdown.Item>
                            <Dropdown.Item disabled={noButtonResponse} onClick={() => onCreate('button')}>Button template</Dropdown.Item>
                        </>
                    }
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
    limitedSelection: PropTypes.bool,
    defaultOpen: PropTypes.bool,
    onClose: PropTypes.func,
    disableExisting: PropTypes.bool,
};

BotResponsePopupContent.defaultProps = {
    value: null,
    noButtonResponse: false,
    limitedSelection: false,
    defaultOpen: false,
    disableExisting: false,
    onSelect: () => {},
    onCreate: () => {},
    onClose: () => {},
};

export default BotResponsePopupContent;
