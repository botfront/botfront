import React from 'react';
import {
    Modal, Segment,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import NluModalContent from './NluModalContent';
import UserUtteranceViewer from '../../../nlu/common/UserUtteranceViewer';

const NluEditor = (props) => {
    const {
        open,
        setModalOpen,
        payload,
        displayedExample,
    } = props;

    const renderModalContent = () => (
        <Segment className='nlu-editor-modal' data-cy='nlu-editor-modal'>
            <div className='nlu-editor-top-content'>
                <UserUtteranceViewer value={payload} disableEditing />
            </div>
            <NluModalContent payload={payload} closeModal={() => setModalOpen(false)} displayedExample={displayedExample} />
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
    displayedExample: PropTypes.object,
};

NluEditor.defaultProps = {
    displayedExample: null,
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

connect(mapStateToProps)(NluEditor);

export default NluEditor;
