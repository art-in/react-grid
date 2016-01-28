﻿import React from 'react';
import {css} from '../../../helpers/react-helpers';

@css({
    date: {
        'white-space': 'nowrap'
    }
})
export default class DateColumn extends React.Component {
    
    static propTypes = {
        rowData: React.PropTypes.shape({
            editing: React.PropTypes.bool
        }).isRequired,
        data: React.PropTypes.string,
        metadata: React.PropTypes.shape({
            columnName: React.PropTypes.string.isRequired,
            editable: React.PropTypes.bool
        }).isRequired
    };

    classes = this.props.sheet.classes;

    onClick = e => {
        e.stopPropagation();
    };

    onKeyDown = e => {
        if (e.keyCode === 13) {
            // enter
            this.save();
        }

        if (e.keyCode === 38 || e.keyCode === 40) {
            // up/down arrows
            // do not propagate, change value instead
            e.stopPropagation();
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
        if (isNaN(Date.parse(this.props.data))) {
            console.error(`Invalid date string: '${this.props.data}'`);
        }

        let date = new Date(this.props.data);

        let dateString = date.toISOString().match(/(.*)T/)[1];
        let dateTimeString = 
            `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

        return (
            <div className={this.classes.date}>
                {this.props.metadata.editable && 
                    this.props.rowData.editing ?

                    <input ref='input'
                        // no support for datetime for now
                        type='date'
                        defaultValue={dateString}
                        onClick={this.onClick}
                        onKeyDown={this.onKeyDown}
                        onBlur={this.onBlur} /> :

                    dateTimeString}
            </div>
        );
    }
}