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
            editable: React.PropTypes.oneOfType([
                React.PropTypes.bool,
                React.PropTypes.func
            ]),
            getTooltip: React.PropTypes.func
        }).isRequired
    };

    save = () => {
        let value = this.refs.input.value;
        this.props.rowData[this.props.metadata.columnName] = value;
    };

    onClick = e => {
        e.stopPropagation();
    };

    onChange = () => {
        this.save();
    };

    render() {
        let {getTooltip, editable} = this.props.metadata;
        let title = getTooltip && getTooltip(this.props.rowData);
        
        // editable flag
        if (this.props.rowData.editing &&
            typeof editable === 'function') {
            editable = editable(this.props.rowData);
        }

        return (
            <div title={title}>
                {editable && this.props.rowData.editing ?

                    <input ref='input'
                        type='text'
                        defaultValue={this.props.data}
                        onChange={this.onChange}
                        onClick={this.onClick} /> :

                    this.props.data}
            </div>
        );
    }
}