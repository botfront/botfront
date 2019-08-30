import {Meteor} from "meteor/meteor";
import React from "react";
import PropTypes from "prop-types"
import {Button} from "semantic-ui-react";
import AceEditor from 'react-ace'
import 'brace/ext/language_tools';
import 'brace/mode/json';
import 'brace/theme/github';
import Dropzone from 'react-dropzone'
import Alert from "react-s-alert";
export default class DataImport extends React.Component {

    constructor(props) {
        super(props)
        this.state = this.getInitialState()
    }

    getInitialState() {
        return {
            values: '',
            fileErrors: [],
            jsonValid: false,
            uploading: false
        }
    }

    uploadData() {
        try{
            this.setState({uploading:true});

            if (this.state.values){
                Meteor.call('templates.import', this.props.projectId, this.state.values, (err,result)=>{
                        this.setState({uploading:false});
                        if (err){
                            Alert.error(`Error: ${err.reason}`, {
                                position: 'bottom',
                                timeout: 'none'
                            });
                        }
                        else{
                            Alert.success(`Data imported successfully!`, {
                                position: 'bottom',
                                timeout: 1000
                            });
                            this.setState({values:''})
                        }
                    })
            }else{
                this.setState({uploading:false});
                Alert.error(`Error: invalid schema`, {
                    position: 'bottom',
                    timeout: 'none'
                });
            }
        } catch (e){
            this.setState({uploading:false})
            Alert.error(`Error: ${e.reason}`, {
                position: 'bottom',
                timeout: 'none'
            });
            console.log(e)
        }

    }

    onDrop(files) {
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                this.setState({values: reader.result})
            };
            reader.onabort = () => console.log('file reading was aborted');
            reader.onerror = () => console.log('file reading has failed');

            reader.readAsText(file,'utf-8');
        });
    }


    onChange = (value) => {
        this.setState({values:value})
    };

    onValidate = (errors) => {
        if (errors.length === 0) {
            this.setState({
                rolesValid: true
            })
        } else {
            this.setState({
                rolesValid: false
            })
        }
    };

    render() {
        return (
            <div>
                <br/><br/>
                <Dropzone
                    multiple={false}
                    onDrop={this.onDrop.bind(this)}>
                    <p> Drop templates in json format </p>
                </Dropzone>
                <br/><br/>
                {this.state.values && (
                    <AceEditor
                        width='100%'
                        mode="json"
                        theme="github"
                        name="templates"
                        fontSize={12}
                        showPrintMargin={false}
                        showGutter={true}
                        onChange={this.onChange}
                        value={this.state.values}
                        onValidate={this.onValidate}
                        editorsProps={{$blockScrolling: true}}
                        setOptions={{
                            enableBasicAutocompletion: true,
                            enableLiveAutocompletion: false,
                            enableSnippets: false,
                            showLineNumbers: false,
                            tabSize: 2,
                        }}/>
                )}
                <br/><br/>
                <Button
                    type='submit'
                    loading={this.state.uploading}
                    onClick={this.uploadData.bind(this)}
                    disabled={this.state.fileErrors.length > 0 || this.state.values === ''}>Upload Templates</Button>


            </div>
        )
    }
}

DataImport.propTypes = {
    projectId: PropTypes.string.isRequired
}