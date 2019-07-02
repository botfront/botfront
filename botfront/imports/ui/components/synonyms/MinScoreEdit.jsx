import React from 'react';
import PropTypes from 'prop-types';
import TextInput from '../utils/TextInput';

export default class MinScoreEdit extends React.Component {
    constructor(props) {
        super(props);
        const { gazette } = props;
        this.state = {
            value: gazette.min_score,
        };
    }

    onDone() {
        const { gazette, onEdit } = this.props;
        const { value } = this.state;
        const copy = gazette.min_score;

        gazette.min_score = value;
        onEdit(gazette, (error) => {
            if (error) {
                gazette.min_score = copy;
                this.setState({ value: copy });
            }
        });
    }

    handleTextChange(value) {
        this.setState({ value: parseInt(value) });
    }

    render() {
        const { value } = this.state;
        return (
            <TextInput
                text={value.toString(10)}
                onBlur={this.onDone.bind(this)}
                onTextChange={this.handleTextChange.bind(this)}
            />
        );
    }
}
