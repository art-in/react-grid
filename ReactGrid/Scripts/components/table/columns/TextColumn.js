import React from 'react';

export default class TextColumn extends React.Component {
    
    static propTypes = {
        rowData: React.PropTypes.shape({
            editing: React.PropTypes.bool
        }).isRequired,
        data: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.number
        ]),
        metadata: React.PropTypes.shape({
            columnName: React.PropTypes.string.isRequired,
            editable: React.PropTypes.bool
        }).isRequired
    };

    onClick = e => {
        e.stopPropagation();
    };

    onKeyDown = e => {
        if (e.keyCode === 13) {
            // enter
            this.save();
        }
    };

    onBlur = () => {
        this.save();
    };

    save = () => {
        let value = this.refs.input.value;
        this.props.rowData[this.props.metadata.columnName] = value;
    };

    render() {
        return (
            <div>
                {this.props.metadata.editable && 
                    this.props.rowData.editing ?

                    <input ref='input'
                        type='text'
                        defaultValue={this.props.data}
                        onClick={this.onClick}
                        onKeyDown={this.onKeyDown}
                        onBlur={this.onBlur} /> :

                    this.props.data}
            </div>
        );
    }
}