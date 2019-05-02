import React from "react";
import PropTypes from 'prop-types'
import {Button, Image, Message, Modal, Container} from "semantic-ui-react";
import {find} from 'lodash'

export default class MCodeModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      error: false,
      loading: false,
      instructionsVisible: false
    }
  }

  onBackButtonEvent(e){
    console.log('handling back button press');
    e.preventDefault();
    this.close()
  }

  componentDidMount() {
    window.onpopstate = this.onBackButtonEvent
  }

  toggleInstructions() {
    this.setState({instructionsVisible: !this.state.instructionsVisible})
  }

  open() {
    this.state.open = true;
    this.setState(this.state);
  }

  close() {
    this.state.open = false;
    this.setState(this.state);
  }

  getImageSrc() {
    return find(this.props.codes, {type: 'app'}).url
  }

  renderHelp() {
    return (
        <Container textAlign="center">
          Ask customer to scan this code with Facebook Messenger (<a onClick={this.toggleInstructions.bind(this)}
                                                                     target="_blank"><strong>How do to that?</strong></a>)
            {this.state.instructionsVisible &&
            <div>
              <a onClick={this.toggleInstructions.bind(this)} target="_blank">
              <Image centered size='medium' bordered
                     src="https://storage.googleapis.com/unline-media/messenger_scan_tuto.gif"/>
              (Hide)</a>
            </div>
            }
        </Container>
    )
  }

  render() {
    return (
      <dic>
        {this.props.codes &&
        <Modal
          trigger={this.props.trigger}
          open={this.state.open}
          onOpen={this.open.bind(this)}
          onClose={this.close.bind(this)}
          size='fullscreen'>
          <Modal.Content>
            <Message info size="large" content={this.renderHelp()}/>
            <Image src={this.getImageSrc()} centered size="large"/>
          </Modal.Content>
          <Modal.Actions>
            <Button basic color='blue' onClick={this.close.bind(this)} content='Close'/>
          </Modal.Actions>
        </Modal>
        }
      </dic>
    )
  }
}

MCodeModal.propTypes = {
  place: PropTypes.object.isRequired,
  codes: PropTypes.array.isRequired
};