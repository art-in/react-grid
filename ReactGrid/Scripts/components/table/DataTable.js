import React from 'react'
import Griddle from 'griddle-react'
import {css} from '../../helpers/react-helpers'
import $ from 'jquery'
import cx from 'classnames'

@css({
    table: {
        '& tbody tr:hover': {
            'background-color': '#f3f3f3',
            'cursor': 'pointer'
        },
        '& tbody tr.selected': {
            'background-color': '#337AB7',
            'color': 'white'
        },
        '& .footer-container': {
            '& .griddle-previous': {
                'display': 'inline-block',
                'width': '20%',
                'text-align': 'left'
            },
            '& .griddle-next': {
                'display': 'inline-block',
                'width': '20%',
                'text-align': 'right'
            },
            '& .griddle-page': {
                'display': 'inline-block',
                'width': '60%',
                'text-align': 'center'
            }
        }
    }
})
export default class DataTable extends React.Component {

    static propTypes = {
        data: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
        columns: React.PropTypes.array.isRequired,
        showRowSelection: React.PropTypes.bool.isRequired,
        onRowSelected: React.PropTypes.func.isRequired,
        onContextMenu: React.PropTypes.func.isRequired
    };

    state = {
        data: []
    };

    classes = this.props.sheet.classes;

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: nextProps.data
        });

        if (!nextProps.showRowSelection) {
            this.state.data.forEach(i => {delete i.selected});
        }
    }

    onRowClick = (rowComponent, e) => {
        let row = rowComponent.props.data;
        
        let {data, contextMenu} = this.state;

        // show context menu
        if (contextMenu) {
            delete this.state.contextMenu;

            if (!row.selected) {
                data.forEach(i => {delete i.selected});
            }

            row.selected = true;

            // save target rows
            let selectedRows = data.filter(row => row.selected);
            this.props.onContextMenu(contextMenu.pos, selectedRows)

        // select row
        } else {
            let rowSelected = row.selected;

            if (!e.ctrlKey) {
                // de-select all the rows
                data.forEach(i => {delete i.selected});
            }

            // select target row
            row.selected = !rowSelected;

            this.props.onRowSelected();
        }

        this.forceUpdate();
    };

    onContextMenu = e => {

        // no header or footer click
        if (!$(e.target).closest('.data-row')[0]) {
            return;
        }

        // show context menu
        let bodyStyle = window.getComputedStyle(document.body, null);
        this.state.contextMenu = {
            pos: {
                x: e.pageX - parseInt(bodyStyle.marginLeft), 
                y: e.pageY - parseInt(bodyStyle.marginTop)
            }
        };

        // HACK: pass event to react component
        // (no support for context menu event for table row from griddle)
        $(e.target).trigger('click');

        e.preventDefault();
    };

    rowMetadata = {
        'bodyCssClassName': (rowData) => {
            let stardart = 'data-row';
            return rowData.selected && this.props.showRowSelection ? 
                cx(stardart, 'selected') : stardart;
        }
    };

    render() {
        return (
            <div onContextMenu={this.onContextMenu}>

                <Griddle ref={'table'}
                         results={this.state.data}
                         columns={this.props.columns}
                         tableClassName={cx('table', 'table-striped', this.classes.table)}
                         showPager={true}
                         resultsPerPage={5}
                         useGriddleStyles={false}
                         onRowClick={this.onRowClick}
                         rowMetadata={this.rowMetadata} />
            </div>
        );
    }

}