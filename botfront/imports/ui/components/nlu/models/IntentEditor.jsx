import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'semantic-ui-react';

export default class IntentEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = { newIntent: this.props.intent };
    }

    onNewName = () => {
        this.props.onNewName(this.state.newIntent);
    };

    onKeyPress = (e) => {
        if (e.key === 'Enter') {
            this.props.onNewName(this.state.newIntent);
        }
    };

    handleTextChange = (event) => {
        this.setState({ newIntent: event.target.value });
    };

    render() {
        const { style } = this.props;
        return (
            <div style={{ width: '100%' }}>
                <span style={{ ...style, fontSize: '12px' }}>
                    {' '}
                    <strong>
                        Rename intent <i>{this.props.intent}</i> to:{' '}
                    </strong>
                </span>
                <br />
                <Input
                    size='small'
                    autoFocus
                    fluid
                    name='name'
                    onChange={this.handleTextChange}
                    value={this.state.newIntent}
                    onBlur={this.onNewName}
                    onKeyPress={this.onKeyPress}
                />
            </div>
        );
    }
}

IntentEditor.propTypes = {
    intent: PropTypes.string.isRequired,
    onRenameIntent: PropTypes.func.isRequired,
    onNewName: PropTypes.func.isRequired,
    style: PropTypes.object,
};

IntentEditor.defaultProps = {
    style: {},
};
