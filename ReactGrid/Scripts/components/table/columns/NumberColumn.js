import React from 'react';

export default class NumberColumn extends React.Component {

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
            editable: React.PropTypes.bool,
            min: React.PropTypes.number.isRequired,
            max: React.PropTypes.number
        }).isRequired
    };

    save = () => {
        let value = parseFloat(this.refs.input.value, 10);
        this.props.rowData[this.props.metadata.columnName] = value;
    };

    onChange = () => {
        this.save();
    };

    onClick = e => {
        e.stopPropagation();
    };

    onKeyDown = e => {
        if (e.keyCode === 38 || e.keyCode === 40) {
            // up/down arrows
            // do not propagate, change value instead
            e.stopPropagation();
        }
    };

    shouldComponentUpdate(nextProps) {
        return nextProps.data !== this.props.data;
    }

    render() {
        return (
            <div>
                {this.props.metadata.editable && 
                    this.props.rowData.editing ?

                    <input ref='input'
                        type='number'
                        min={this.props.metadata.min}
                        max={this.props.metadata.max}
                        defaultValue={this.props.data}
                        onClick={this.onClick}
                        onChange={this.onChange}
                        onKeyDown={this.onKeyDown} /> :

                    this.props.data}
            </div>
        );
    }
}