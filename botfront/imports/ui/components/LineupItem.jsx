import React from 'react';
import PropTypes from 'prop-types';
import {Button, Card, Header, Icon, Image, Modal} from 'semantic-ui-react';
import TableModal from './TableModal'
import Confirm from './Confirm';
import moment from 'moment';
export default class LineupItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            seatModalOpen: false,
            removeModalOpen:false,
            editModalOpen:false
        }
    }

    getAddedInfo(){
        return (
          <div>
            {this.props.table.type === 'messenger' && <span style={{color:'#2185D0'}}>From Messenger </span>}
            {this.props.table.type === 'manual' && <span>Added by staff </span>}
              {moment(this.props.table.createdAt).fromNow()}
          </div>
        )
    }

    render() {
        return (
            <Card fluid>
                <Card.Content>
                    { this.props.table.profile.profile_pic &&
                    <Image floated='right' size='mini' src={this.props.table.profile.profile_pic}/>
                    }
                    <Card.Header>
                        {this.props.table.people}<Icon name='user'/>- {this.props.table.profile.first_name}
                    </Card.Header>
                    <Card.Meta>
                        {this.getAddedInfo()}
                    </Card.Meta>
                </Card.Content>
                <Card.Content extra>
                    <div className='ui four buttons'>
                        <Confirm
                            trigger={<Button basic color='green' ><Icon name='food'/>Seat</Button>}
                            title={'Give a table to '+ this.props.table.profile.first_name+ '\'s group?'}
                            pos="Yes, give table"
                            neg="Cancel"
                            posCb={this.props.onProcess}
                        />
                        <TableModal
                            trigger={<Button basic color='orange' ><Icon name='compose'/>Edit</Button>}
                            place={this.props.place}
                            table={this.props.table}
                            title="Edit Group"
                            onSubmit={this.props.onEdit}
                        />
                        <Confirm
                            trigger={<Button basic color='red' ><Icon name='delete'/>Remove</Button>}
                            title={'Remove '+ this.props.table.profile.first_name+ ' from the wait list?'}
                            message={'This will permanently remove '+ this.props.table.profile.first_name + ' from the wait list.'}
                            pos="Yes, remove group"
                            neg="Cancel"
                            posCb={this.props.onDelete}
                        />
                    </div>
                </Card.Content>
            </Card>
        );
    }
}

LineupItem.propTypes = {
    place: PropTypes.object.isRequired,
    onDelete: PropTypes.func.isRequired,
    onProcess: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
};