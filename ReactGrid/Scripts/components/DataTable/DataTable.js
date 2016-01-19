import React from 'react'
import Griddle from 'griddle-react'
import {css} from '../../helpers/react-helpers'

@css({
    wrapper: {
        'outline': 'none'
    },
    table: {
        '& tbody tr:hover': {
            'background-color': '#f3f3f3',
            'cursor': 'pointer'
        },
        '& tbody tr.selected': {
            'background-color': '#337AB7',
            'color': 'white'
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

    onRowClick = (rowComponent, e) => {

        let row = rowComponent.props.data;
        let rowSelected = row.selected;

        if (!e.ctrlKey) {
            // de-select all the rows
            this.state.data.forEach(i => {delete i.selected});
        }

        // select target row
        row.selected = !rowSelected;

        this.forceUpdate();
    };

    onBlur = () => {
        this.state.data.forEach(i => {delete i.selected});
        this.forceUpdate();
    };

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: nextProps.data,
            columns: nextProps.columns
        });
    }

    rowMetadata = {
        'bodyCssClassName': function(rowData) {
            return rowData.selected === true ? 'selected' : null;
        }
    };

    render() {
        return (
            <div className={this.classes.wrapper}
                 tabIndex='0' onBlur={this.onBlur}>

                <Griddle results={this.state.data}
                         columns={this.state.columns}
                         tableClassName={'table table-striped ' + this.classes.table}
                         showPager={false}
                         useGriddleStyles={false}
                         onRowClick={this.onRowClick}
                         rowMetadata={this.rowMetadata} />

            </div>
        );
    }

}