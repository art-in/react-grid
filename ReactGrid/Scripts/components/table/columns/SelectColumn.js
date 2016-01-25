﻿import React from 'react'

export default class SelectColumn extends React.Component {
    
    static propTypes = {
        rowData: React.PropTypes.object.isRequired,
        data: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.number
        ]),
        metadata: React.PropTypes.shape({
            selectOptions: React.PropTypes.arrayOf(
                React.PropTypes.shape({
                    value: React.PropTypes.number.isRequired,
                    displayValue: React.PropTypes.string.isRequired
                })).isRequired
        }).isRequired
    };

    onClick = e => {
        e.stopPropagation();
    };

    onKeyDown = e => {
        if (e.keyCode === 13) {
            // enter
            // update source data
            let value = parseInt(this.refs.select.value);
            this.props.rowData[this.props.metadata.columnName] = value;
        }

        if (e.keyCode === 38 || e.keyCode === 40) {
            // up/down arrows
            // do not propagate, change value instead
            e.stopPropagation();
        }
    };

    render() {
        let option = this.props.metadata.selectOptions
            .find(o => o.value === this.props.data);

        if (!option) {
            throw Error(`Option with value '${this.props.data}' was not found`);
        }

        return (
            <div>
                {this.props.rowData.editing ?

                    <select ref='select'
                        onClick={this.onClick}
                        onKeyDown={this.onKeyDown}
                        defaultValue={this.props.data}>
                        
                        {this.props.metadata.selectOptions.map(o => 
                            <option value={o.value} key={o.value}>
                                {o.displayValue}
                            </option>)}
                    </select> :
                    
                    option.displayValue
                }
            </div>
        );
    }
}