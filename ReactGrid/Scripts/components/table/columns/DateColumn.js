import React from 'react';
import moment from 'moment';
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
            editable: React.PropTypes.oneOfType([
                React.PropTypes.bool,
                React.PropTypes.func
            ])
        }).isRequired
    };

    classes = this.props.sheet.classes;

    save = () => {
        let value = this.refs.input.value;
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
            // do not propagate, change value instead
            e.stopPropagation();
        }
    };

    render() {
        let {editable} = this.props.metadata;

        // editable flag
        if (this.props.rowData.editing &&
            typeof editable === 'function') {
            editable = editable(this.props.rowData);
        }

        // parse date
        let date = moment(this.props.data);

        if (!date.isValid()) {
            console.error(`Invalid date string: '${this.props.data}'`);
        }

        // localize without shifting time zome (as Date would do)
        // e.g. input date string is '2016-02-16T11:51:17.607'
        // Date() will parse it as UTC in 0 tz, then localization will
        // add several hours. this will secure formatting only.
        // e.g. format result is '02/16/2016, 11:51:17 PM'
        let dateTimeString = date.format('L, LTS');
        let dateString = date.format('YYYY-MM-DD');
        
        return (
            <div className={this.classes.date}>
                {editable && this.props.rowData.editing ?

                    <input ref='input'
                        // no support for datetime for now
                        type='date'
                        defaultValue={dateString}
                        onClick={this.onClick}
                        onChange={this.onChange}
                        onKeyDown={this.onKeyDown} /> :

                    dateTimeString}
            </div>
        );
    }
}