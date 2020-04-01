import React from 'react';
import {
    Modal, Icon, Segment,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ModalContent from './ModalContent';
import UserUtteranceViewer from '../../../nlu/common/UserUtteranceViewer';

const NluEditor = (props) => {
    const {
        open,
        setModalOpen,
        payload,
    } = props;

    const renderModalContent = () => (
        <Segment className='nlu-editor-modal'>
            <div className='nlu-editor-top-content'>
                <UserUtteranceViewer value={payload} disableEditing />
            </div>
            <ModalContent payload={payload} closeModal={() => setModalOpen(false)} />
        </Segment>

    );

    return (
        <Modal
            trigger={<div />}
            content={renderModalContent}
            open={open}
        />
    );
};

NluEditor.propTypes = {
    open: PropTypes.bool.isRequired,
    setModalOpen: PropTypes.func.isRequired,
    payload: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

connect(mapStateToProps)(NluEditor);

export default NluEditor;
