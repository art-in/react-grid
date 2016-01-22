import React from 'react'
import ReactDOM from 'react-dom'
import Griddle from 'griddle-react'
import {css} from '../../helpers/react-helpers'
import $ from 'jquery'
import cx from 'classnames'
import {alphabetSorter} from './sorters'

@css({
    wrapper: {
        '& .table': {
            '& thead th:hover': {
                'cursor': 'pointer'
            },
            '& thead th[data-title=selected]': {
                // hide strange 'selected' column header
                // https://github.com/GriddleGriddle/Griddle/issues/323
                'display': 'none'
            },
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
            },
            '& tbody tr': {
                // disable selection (for batch selection with shift)
                '-webkit-user-select': 'none',
                '-khtml-user-select': 'none',
                '-khtml-user-select': 'none',
                '-moz-user-select': 'none',
                '-ms-user-select': 'none',
                'user-select': 'none'
            }
        },
        '& .griddle-nodata': {
            'padding': '10px',
            'text-align': 'center'
        }
    }
})
export default class DataTable extends React.Component {

    static propTypes = {
        data: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
        columns: React.PropTypes.array.isRequired,
        showRowSelection: React.PropTypes.bool.isRequired,
        onRowSelected: React.PropTypes.func.isRequired,
        onContextMenu: React.PropTypes.func.isRequired,
        paging: React.PropTypes.bool,
				noDataMessage: React.PropTypes.string
    };

    static defaultProps = {
        paging: true,
				noDataMessage: 'No data to display'
    };

    state = {
        data: [],
        pageData: [],
        pageCurrent: 0,
        pageSize: 5,
        pagesCount: 0,
        sortColumnName: null,
        sortAscending: true
    };

    classes = this.props.sheet.classes;

    componentWillReceiveProps(nextProps) {
        this.state.data = nextProps.data;

        if (!nextProps.showRowSelection) {
            nextProps.data.forEach(i => {delete i.selected});
        }

        if (!nextProps.paging) {
            this.state.pageSize = +Infinity;
        }
        
        let sortColumnName = this.state.sortColumnName;
        if (!sortColumnName) {
            // get initial sort column
            let columnData = nextProps.columns.find(c => c.initialSort);
            if (columnData) {
                sortColumnName = columnData.columnName;
            }
        }

        this.updatePageData(
            this.state.data,
            nextProps.columns,
            null,
            sortColumnName,
            this.state.sortAscending,
            this.state.pageCurrent,
            this.state.pageSize);
    }

    /**
     * Applies sorting and paging for the data.
     */
    updatePageData(data, columnsMetadata, filterString, sortColumn, sortAscending, page, pageSize) {
       
        // filter
        if (filterString) {
            throw Error('Filtering not implemented');
        }

        // sort
        let columnMetadata = columnsMetadata.find(c => c.columnName === sortColumn);
        let columnSorter = (columnMetadata && columnMetadata.sorter) || alphabetSorter(sortColumn);

        // in case pass wrong sorter func
        if (columnSorter.length < 2) {
            console.warn('column sorter consumes less arguments than required (a, b)!');
        }

        data.sort(columnSorter);

        if(sortAscending === false) {
            data.reverse();
        }

        // page
        let pagesCount = Math.round(
        data.length > pageSize ?
            Math.ceil(data.length / pageSize) : 1);

        if (pagesCount <= page) {
            // go to last page is there is no rows on current one
            page = pagesCount - 1;
        }

        var startRowIdx = page === 0 ?
            0 :
            page * pageSize;

        let lastRowIdx = startRowIdx + pageSize > data.length ?
                data.length : 
                startRowIdx + pageSize;
        
        let pageRows = data.slice(startRowIdx, lastRowIdx);

        this.setState({
                    pageData: pageRows,
                    pageCurrent: page,
                        pageSize: pageSize,
                        pagesCount: pagesCount,
                sortColumnName: sortColumn,
                sortAscending: sortAscending
                });
    }

    onRowClick = (rowComponent, e) => {
        let row = rowComponent.props.data;
        
        let {contextMenu} = this.state;

        // show context menu
        if (contextMenu) {
            delete this.state.contextMenu;

            if (!row.selected) {
                this.state.data.forEach(i => {delete i.selected});
            }

            row.selected = true;

            // save target rows
            let selectedRows = this.state.data.filter(row => row.selected);
            this.props.onContextMenu(contextMenu.pos, selectedRows)

        // select rows
        } else {
            
            // batch
            let selectedRow = this.state.pageData.find(r => r.selected);
            if (e.shiftKey && selectedRow) {
                
                let rowFromIdx = this.state.pageData.indexOf(selectedRow);
                let rowToIdx = this.state.pageData.indexOf(row);

                let goForward = rowFromIdx < rowToIdx;

                // select all rows between previously selected and just selected row
                let i = rowFromIdx;
                let done;
                while (!done) {
                    let currentRow = this.state.pageData[i];
                    currentRow.selected = true;
                    
                    i = goForward ? ++i : --i;
                    done = goForward ? (i > rowToIdx) : (i < rowToIdx);
                }

            // single
            } else {
                let rowSelected = row.selected;

                if (!e.ctrlKey) {
                    // de-select all the rows
                    this.state.data.forEach(i => {delete i.selected});
                }

                // select target row
                row.selected = !rowSelected;
            }

            this.props.onRowSelected(row);
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

    onSetPage = (pageNumber) => {
        
        this.updatePageData(
            this.state.data,
            this.props.columns,
            null,
            this.state.sortColumnName,
            this.state.sortAscending,
            pageNumber,
            this.state.pageSize);
    };

    onChangeSort = (sort, sortAscending) => {
        let pageCurrent = this.state.pageCurrent;
        if (sort != this.state.sortColumnName) {
            // move to first page on sort column change
            pageCurrent = 0;
        }

        this.updatePageData(
            this.state.data,
            this.props.columns,
            null,
            sort,
            sortAscending,
            pageCurrent,
            this.state.pageSize);
    };

    //this method handles the filtering of the data
    onSetFilter = (filter) => {
        throw Error('Not implemented');
    };

    //this method handles determining the page size
    onSetPageSize = (size) => {
        this.updatePageData(
            this.state.data,
            this.props.columns,
            null,
            this.state.sortColumnName,
            this.state.sortAscending,
            this.state.pageCurrent,
            size);
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
            <div onContextMenu={this.onContextMenu}
                 className={ this.classes.wrapper}>

                <Griddle ref={'table'}
                         results={this.state.pageData}
                         columnMetadata={this.props.columns}
                         tableClassName={cx('table', 'table-striped')}
                         useGriddleStyles={false}
                         onRowClick={this.onRowClick}
                         rowMetadata={this.rowMetadata}
                         showFilter={false}
                         showSettings={false}
                         showPager={this.props.paging}
					     noDataMessage={this.props.noDataMessage}
                         
                         useExternal={true}
                         externalChangeSort={this.onChangeSort}
                         externalSetPage={this.onSetPage}
                         externalSetPageSize={this.onSetPageSize}
                         externalSetFilter={this.onSetFilter}

                         externalMaxPage={this.state.pagesCount}
                         resultsPerPage={this.state.pageSize}
                         externalCurrentPage={this.state.pageCurrent} 
                         externalSortColumn={this.state.sortColumnName} 
                         externalSortAscending={this.state.sortAscending}/>
            </div>
        );
    }

}
