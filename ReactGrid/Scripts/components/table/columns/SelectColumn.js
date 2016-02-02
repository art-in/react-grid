import React from 'react';

export default class SelectColumn extends React.Component {

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
            selectOptions: React.PropTypes.arrayOf(
                React.PropTypes.shape({
                    value: React.PropTypes.number.isRequired,
                    displayValue: React.PropTypes.string.isRequired
                })).isRequired
        }).isRequired
    };

    save = () => {
        let value = parseInt(this.refs.select.value, 10);
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
        let option = this.props.metadata.selectOptions
            .find(o => o.value === this.props.data);

        if (!option) {
            throw Error(
                `Select option with value '${this.props.data}' was not found`);
        }

        return (
            <div>
                {this.props.metadata.editable && 
                    this.props.rowData.editing ?

                    <select ref={'select'}
                        defaultValue={this.props.data}
                        onClick={this.onClick}
                        onChange={this.onChange}
                        onKeyDown={this.onKeyDown}>

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