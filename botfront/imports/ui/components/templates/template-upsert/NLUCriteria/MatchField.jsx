import PropTypes from 'prop-types';
import React from 'react';
import connectField from 'uniforms/connectField';
import NLUCriteriaEditor from './NLUCriteriaEditor';


class MatchField extends React.Component {
    handleNLUCriteriaChange = (e) => {
        const { onChange } = this.props;
        onChange(e);
    };

    render() {
        const {
            projectId, value, error, errorMessage,
        } = this.props;
        return (
            <>
                <NLUCriteriaEditor
                    onChange={this.handleNLUCriteriaChange}
                    projectId={projectId}
                    value={value}
                />
                
                {!!error && <div className='ui red basic pointing label'>{errorMessage}</div>}
            </>
        );
    }
}

MatchField.propTypes = {
    projectId: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.object,
    error: PropTypes.object,
    errorMessage: PropTypes.string.isRequired,
};

MatchField.defaultProps = {
    error: null,
    value: null,
};

export default connectField(MatchField, { includeParent: true, initialValue: false });
