/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';
import LookupTableValueEditor from './LookupTableValueEditor';
import LookupTableValueViewer from './LookupTableValueViewer';
import { can } from '../../../lib/scopes';

export default class LookupTableValueEditorViewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = { edit: false };
    }

    setEditMode = () => {
        const { edit } = this.state;
        const { projectId } = this.props;
        if (!edit && can('nlu-data:w', projectId)) {
            this.setState({ edit: true });
        }
    };

    onEditDone = (entitySynonym) => {
        const { onEdit } = this.props;
        this.setState({ edit: false });
        onEdit(entitySynonym);
    };

    render() {
        const { edit } = this.state;
        const { entitySynonym, keyAttribute } = this.props;
        return (
            <div onClick={this.setEditMode}>
                {edit && <LookupTableValueEditor keyAttribute={keyAttribute} entitySynonym={entitySynonym} onDone={this.onEditDone} />}
                {!edit && <LookupTableValueViewer value={entitySynonym[keyAttribute]} />}
            </div>
        );
    }
}

LookupTableValueEditorViewer.propTypes = {
    entitySynonym: PropTypes.object,
    onEdit: PropTypes.func.isRequired,
    listAttribute: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    keyAttribute: PropTypes.string.isRequired,
};

LookupTableValueEditorViewer.defaultProps = {
    entitySynonym: {},
};
