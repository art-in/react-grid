import React from 'react'

export default class NumberColumn extends React.Component {
    
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

        if (e.keyCode === 38 || e.keyCode === 40) {
            // up/down arrows
            // do not propagate, change value instead
            e.stopPropagation();
        }
    };

    render() {
        return (
            <div>
                {this.props.rowData.editing ?

                    <input ref='input'
                        type='number'
                        defaultValue={this.props.data}
                        onClick={this.onClick}
                        onKeyDown={this.onKeyDown} /> :

                    this.props.data}
            </div>
        );
    }
}