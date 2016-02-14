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
            editable: React.PropTypes.oneOfType([
                React.PropTypes.bool,
                React.PropTypes.func
            ]),
            selectOptions: React.PropTypes.oneOfType([
                React.PropTypes.arrayOf(
                    React.PropTypes.shape({
                        value: React.PropTypes.number.isRequired,
                        displayValue: React.PropTypes.string.isRequired
                    })),
                React.PropTypes.func
            ]).isRequired,
            onSelectChange: React.PropTypes.func
        }).isRequired
    };

    save = () => {
        let value = parseInt(this.refs.select.value, 10);
        this.props.rowData[this.props.metadata.columnName] = value;
    };

    onChange = () => {
        this.save();

        let {onSelectChange} = this.props.metadata;

        if (onSelectChange) {
            onSelectChange(this.props.rowData);
        }
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

    render() {
        let {selectOptions, columnName, editable} = this.props.metadata;

        // editable flag
        if (this.props.rowData.editing &&
            typeof editable === 'function') {
            editable = editable(this.props.rowData);
        }

        // options
        if (typeof selectOptions === 'function') {
            selectOptions = selectOptions(this.props.rowData);
        }

        let option = selectOptions
            .find(o => o.value === this.props.data);

        if (!option) {
            throw Error(
                `Select option with value '${this.props.data}' ` +
                `for column '${columnName}' was not found`);
        }

        return (
            <div>
                {editable && this.props.rowData.editing ?

                    <select ref={'select'}
                        defaultValue={this.props.data}
                        onClick={this.onClick}
                        onChange={this.onChange}
                        onKeyDown={this.onKeyDown}>

                        {selectOptions.map(o =>
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