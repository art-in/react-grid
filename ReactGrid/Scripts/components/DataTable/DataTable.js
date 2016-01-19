import React from 'react'
import Griddle from 'griddle-react'
import {css} from '../../helpers/react-helpers'
import $ from 'jquery'
import ContextMenu from '../Menu/ContextMenu'

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
        columns: [],
        contextMenu: {
            shown: false,
            pos: {
                x: null,
                y: null
            }
        }
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
        this.state.contextMenu.shown = false;
        this.forceUpdate();
    };

    onContextMenu = (e) => {
        // is header click?
        let headerRow = $(e.target).closest('thead')[0];
        if (headerRow) {
            this.onBlur();
            return;
        }

        // pass event to react component
        // (no support for context menu event from griddle)
        $(e.target).click();

        // show context menu
        let {contextMenu} = this.state;
        contextMenu.shown = true;
        contextMenu.pos = {x: e.clientX, y: e.clientY};

        e.preventDefault();
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
            <div className={this.classes.wrapper} tabIndex='0'
                onBlur={this.onBlur}
                onContextMenu={this.onContextMenu}>

                <Griddle results={this.state.data}
                         columns={this.state.columns}
                         tableClassName={'table table-striped ' + this.classes.table}
                         showPager={false}
                         useGriddleStyles={false}
                         onRowClick={this.onRowClick}
                         rowMetadata={this.rowMetadata} />
            
                {this.state.contextMenu.shown &&
                    <ContextMenu pos={this.state.contextMenu.pos} />}
            </div>
        );
    }

}