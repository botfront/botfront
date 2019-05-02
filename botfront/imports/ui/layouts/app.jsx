import React from 'react';

export default class  App extends React.Component {

    render(){
        const {children} = this.props;
        const style = {

        };
        return (
            <div style={style}>
                <span>
                { children }
                </span>
            </div>
        )
    }
}