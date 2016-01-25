import React from 'react'

export default class TextColumn extends React.Component {
    
    static propTypes = {
        rowData: React.PropTypes.object.isRequired,
        data: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.number
        ]),
        metadata: React.PropTypes.object.isRequired
    };

    onClick = e => {
        e.stopPropagation();
    };

    onKeyDown = e => {
        if (e.keyCode === 13) {
            // enter
            // update source data
            let value = this.refs.input.value;
            this.props.rowData[this.props.metadata.columnName] = value;
        }
    };

    render() {
        return (
            <div>
                {this.props.rowData.editing ?

                    <input ref='input'
                        type='text'
                        defaultValue={this.props.data}
                        onClick={this.onClick}
                        onKeyDown={this.onKeyDown} /> :

                    this.props.data}
            </div>
        );
    }
}