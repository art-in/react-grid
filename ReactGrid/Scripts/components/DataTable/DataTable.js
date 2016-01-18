import React from 'react'
import Griddle from 'griddle-react'
import {css} from '../../helpers/react-helpers'

@css({
    table: {
        '& tbody tr:hover': {
            'background-color': 'lightgray',
            'cursor': 'pointer'
        },
        '& tbody tr.selected': {
            'background-color': 'lightblue'
        }
    }
})
export default class DataTable extends React.Component {

    classes = this.props.sheet.classes;

    state = {
        data: [],
        columns: []
    };

    static propTypes = {
        data: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
        columns: React.PropTypes.array
    };

    onRowClick = (e) => {
        let item = this.state.data.filter(item => item.Id === e.props.data.Id)[0];
        item.selected = !item.selected;
        this.forceUpdate();
    };

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: nextProps.data,
            columns: nextProps.columns
        });
    }

    rowMetadata = {
        "bodyCssClassName": function(rowData) {
            if (rowData.selected === true) {
                return "selected";
            } else {
                return null;
            }
        }
    };

    render() {
        return (
            <Griddle results={this.state.data}
                     columns={this.state.columns}
                     tableClassName={"table table-striped " + this.classes.table}
                     showPager={false}
                     useGriddleStyles={false}
                     onRowClick={this.onRowClick}
                     rowMetadata={this.rowMetadata} />
        );
    }

}