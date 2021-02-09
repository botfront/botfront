import React, {
    useMemo,
    useState,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';


import { clearTypenameField } from '../../../lib/client.safe.utils';
import Graph from './graph/GraphWrapper';


const CreateForm = (props) => {
    const {
        initialModel,
        onSubmit,
    } = props;

    const {
        graph_elements: graphElements,
        formName,
        description,
        // eslint-disable-next-line camelcase
        collect_in_botfront,
        _id,
        updatedAt: dbUpdatedAt,
    } = useMemo(() => initialModel || {}, [initialModel]);
    const [updatedAt, setUpdatedAt] = useState(dbUpdatedAt);
    const [graphKey, setGraphKey] = useState(dbUpdatedAt);

    const handleSubmit = (incomingModel) => {
        onSubmit(clearTypenameField(incomingModel));
    };

    const handleGraphSave = (elements, settings) => {
        if (updatedAt !== dbUpdatedAt && Date.now() - dbUpdatedAt > 2000) {
            setUpdatedAt(dbUpdatedAt);
            setGraphKey(dbUpdatedAt);
            return;
        }
        onSubmit(clearTypenameField({ ...initialModel, graph_elements: elements, ...settings }), (res) => {
            setUpdatedAt(res.data.upsertForm.updatedAt);
        });
    };

    return (
        <div
            className='form-graph-wrapper'
        >
            <Graph
                key={graphKey}
                formName={formName}
                onSave={handleGraphSave}
                onSettingsSave={handleSubmit}
                DbElements={graphElements}
                formId={_id}
                formSettings={{ description, collect_in_botfront }}
                slots={initialModel ? initialModel.slots : []}
            />
        </div>

    );
};

CreateForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    initialModel: PropTypes.object,
};

CreateForm.defaultProps = {
    initialModel: { slotNames: [] },
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(CreateForm);
