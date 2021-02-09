/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';
import LookupTableListEditor from './LookupTableListEditor';
import LookupTableListViewer from './LookupTableListViewer';
import { can } from '../../../lib/scopes';
import LookupTableStringViewer from './LookupTableStringViewer';
import LookupTableStringEditor from './LookupTableStringEditor';

export default class LookupTableListEditorViewer extends React.Component {
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
        const { entitySynonym, listAttribute, multiple } = this.props;
        return (
            <div onClick={this.setEditMode}>
                {edit && (multiple
                    ? <LookupTableListEditor listAttribute={listAttribute} entitySynonym={entitySynonym} onDone={this.onEditDone} />
                    : <LookupTableStringEditor listAttribute={listAttribute} item={entitySynonym} onDone={this.onEditDone} />
                )}
                {!edit && (multiple
                    ? <LookupTableListViewer listAttribute={listAttribute} entitySynonym={entitySynonym} />
                    : <LookupTableStringViewer listAttribute={listAttribute} item={entitySynonym} />
                )}
            </div>
        );
    }
}

LookupTableListEditorViewer.propTypes = {
    entitySynonym: PropTypes.object,
    onEdit: PropTypes.func.isRequired,
    listAttribute: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    multiple: PropTypes.bool,
};

LookupTableListEditorViewer.defaultProps = {
    entitySynonym: {},
    multiple: true,
};
