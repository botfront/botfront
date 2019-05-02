import React, {Component, PropTypes} from "react";
import {Dropdown} from "semantic-ui-react";
import {Meteor} from "meteor/meteor";

import Select from 'react-select';


export default class SelectIntent extends React.Component {
  state = {
    selectedOption: this.props.selectedOption,
  }

  handleChange = (event, selectedOption) => {
    this.setState({ selectedOption: selectedOption.value });
    this.props.onChange(selectedOption.value)
  }
  render() {

    return (
        <Dropdown
            simple
            item
            name={this.props.name}
            placeholder='Filter by intent'
            search
            defaultValue={this.props.selectedOption}
            selection
            onChange={this.handleChange}
            options={this.props.intents} />

    );
  }
}

SelectIntent.propTypes = {
  intents: PropTypes.array.isRequired,
  onChange:PropTypes.func.isRequired,
  selectedOption: PropTypes.string,
  name: PropTypes.string
};