import React from 'react';
import PropTypes from 'prop-types';
import connectField from 'uniforms/connectField';
import { Dropdown } from 'semantic-ui-react';

const propTypeModels = PropTypes.arrayOf(PropTypes.shape({
    modelId: PropTypes.string,
    name: PropTypes.string,
}));

class ModelDropdown extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: null,
        };

        this.onClick = this.onClick.bind(this);
    }

    onClick(e, { value }) {
        const { onChange } = this.props;
        const { name, modelId } = JSON.parse(value);

        this.setState({ name });
        onChange(modelId);
    }

    render() {
        const { name: dropdownLabel } = this.state;
        const { models, label, ...dropProps } = this.props;

        return (
            <Dropdown
                text={dropdownLabel || label}
                {...dropProps}
                selection
                onChange={this.onClick}
                options={models.map(({ modelId, name }) => ({
                    key: modelId,
                    value: JSON.stringify({ modelId, name }),
                    text: name,
                }))}
            />
        );
    }
}

ModelDropdown.propTypes = {
    onChange: PropTypes.func.isRequired,
    models: propTypeModels.isRequired,
    label: PropTypes.string.isRequired,
};

function ModelField({ models, onChange }) {
    return (
        <div className='required field'>
            <label>NLU Model</label>
            <ModelDropdown label='Pick a Model' fluid models={models} onChange={onChange} />
        </div>

    );
}

ModelField.propTypes = {
    onChange: PropTypes.func.isRequired,
    models: propTypeModels.isRequired,
};

export default connectField(ModelField);
