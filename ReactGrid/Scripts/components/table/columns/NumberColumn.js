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
            editable: React.PropTypes.oneOfType([
                React.PropTypes.bool,
                React.PropTypes.func
            ]),
            min: React.PropTypes.number.isRequired,
            max: React.PropTypes.number,
            step: React.PropTypes.number
        }).isRequired
    };

    state = {
        value: ''
    };

    save = value => {
        this.props.rowData[this.props.metadata.columnName] = value;
    };

    handleProps(props) {
        this.setState({
            value: props.data || ''
        });
    }
    
    componentWillMount() {
        this.handleProps(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.handleProps(nextProps);
    }
    
    onChange = () => {
        let inputValue = this.refs.input.value;
        let value = parseFloat(inputValue, 10);

        // allow entering dot in IE
        if (inputValue[inputValue.length - 1] === '.') {
            this.setState({value: inputValue});
            this.save(value);
        } else {

            // prevent saving empty NaN in IE
            if (inputValue === '') {
                value = 0;
            }

            // prevent invalid input in FF and IE
            if (!isNaN(value)) {
                this.setState({value: inputValue});
                this.save(value);
            }
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
        let {editable} = this.props.metadata;

        // editable flag
        if (this.props.rowData.editing &&
            typeof editable === 'function') {
            editable = editable(this.props.rowData);
        }

        return (
            <div>
                {editable && this.props.rowData.editing ?

                    <input ref='input'
                        type='number'
                        min={this.props.metadata.min}
                        max={this.props.metadata.max}
                        step={this.props.metadata.step}
                        value={this.state.value}
                        onClick={this.onClick}
                        onChange={this.onChange}
                        onKeyDown={this.onKeyDown} /> :

                    this.props.data}
            </div>
        );
    }
}