import React from 'react'
import ReactDOM from 'react-dom'
import Griddle from 'griddle-react'
import {css} from '../../helpers/react-helpers'
import $ from 'jquery'
import cx from 'classnames'
import {alphabetSorter} from './sorters'

@css({
    wrapper: {
        // to get row offset relative to wrapper,
        // for appropriate scrolling
        'position': 'relative',

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
                // TODO: use jsx plugin for vendor prefixes
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
        paging: React.PropTypes.bool,
        noDataMessage: React.PropTypes.string,
        onContextMenu: React.PropTypes.func.isRequired,
        onRowSelected: React.PropTypes.func.isRequired,
        onAllRowsSelected: React.PropTypes.func.isRequired,
        onAllRowsDeselected: React.PropTypes.func.isRequired,
        onBlur: React.PropTypes.func.isRequired
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
        sortAscending: true,

        // currently selected row
        activeRowData: null
    };

    classes = this.props.sheet.classes;

    componentWillReceiveProps(nextProps) {
        this.state.data = nextProps.data;

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

        // in case pass invalid sorter func
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

        // context menu event
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

        this.state.activeRowData = row;

        this.forceUpdate();
    };

    onContextMenu = e => {

        // no header or footer click
        if (!$(e.target).closest('.data-row')[0]) {
            return;
        }

        // show context menu
        this.state.contextMenu = {
            pos: {
                x: e.clientX, 
                y: e.clientY
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

    onSetFilter = (filter) => {
        throw Error('Not implemented');
    };

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

    onKeyDown = e => {
        
        switch (e.keyCode) {
        case 27:
            // esc
            // de-select all
            this.state.data.forEach(r => delete r.selected);
            this.props.onAllRowsDeselected();
            this.forceUpdate();
        break;
        case 38:
            // arrow up
            this.moveNextRow(false, e.shiftKey);
            e.preventDefault();
        break;
        case 40:
            // arrow down
            this.moveNextRow(true, e.shiftKey);
            e.preventDefault();
        break;
        case 65:
            // ctrl+a
            if (e.ctrlKey) {
                // select all on current page
                this.state.pageData.forEach(r => r.selected = true);
                this.props.onAllRowsSelected();
                this.forceUpdate();
                e.preventDefault();
            }
        break;
        }

    };

    moveNextRow(down, batch) {
        let {pageData} = this.state;

        // get selected row index
        let selectedIdx;
        if (pageData.some(r => r.selected)) {
            if (down) {
                // last selected row
                pageData.reverse();
                selectedIdx = pageData.length - pageData.findIndex(r => r.selected) - 1;
                pageData.reverse();
            } else {
                // first selected row
                selectedIdx = pageData.findIndex(object => object.selected);
            }
        } else {
            selectedIdx = -1;
        }

        if ((down && selectedIdx === pageData.length - 1) ||
            (!down && selectedIdx === 0)) {
            // no move outside
            return;
        }

        if (!batch) {
            pageData.forEach(r => delete r.selected);
        }

        // get index of row to select next
        let nextToSelectIdx = selectedIdx === -1 ?
            (down ? 0 : pageData.length - 1) :
            (down ? selectedIdx + 1 : selectedIdx - 1);
        
        let rowToSelect = pageData[nextToSelectIdx];
        
        rowToSelect.selected = true;

        this.props.onRowSelected(rowToSelect);
        this.state.activeRowData = rowToSelect;

        this.forceUpdate();
    }

    componentDidUpdate() {
        
        // scroll to make active row visible
        let activeRowData = this.state.activeRowData;
        if (activeRowData) {
            delete this.state.activeRowData;

            let rowIdx = this.state.pageData.indexOf(activeRowData);
            
            let $wrapperNode = $(ReactDOM.findDOMNode(this.refs.wrapper));
            let $tableNode = $(ReactDOM.findDOMNode(this.refs.table));
            let $rowNode = $tableNode.find('.data-row').eq(rowIdx);
            
            if ($rowNode.length === 0) {
                throw Error('Active row node not found');
            }

            // row offset relative to wrapper (without wrapper scroll)
            let rowOffsetTop = $rowNode.position().top;

            // wrapper scroll from top
            let wrapperScrollTop = $wrapperNode.scrollTop();

            let rowHeight = $rowNode.height();
            let wrapperHeight = $wrapperNode.height();

            if (rowOffsetTop < wrapperScrollTop) {
                // row is above the scroll frame
                $wrapperNode.scrollTop(rowOffsetTop);
            } else {
                let diff = (rowOffsetTop + rowHeight) - 
                    (wrapperScrollTop + wrapperHeight);

                if (diff > 0) {
                    // row is below the scroll frame
                    $wrapperNode.scrollTop(wrapperScrollTop + diff);
                }
            }
        }
    }

    onBlur = e => {
        if (e.target !== this.refs.wrapper) {
            // table nav buttons can throw 'blur' too
            // interested in table wrapper 'blur' only
            return;
        }
        
        this.state.data.forEach(i => {delete i.selected});

        this.props.onBlur();
        this.forceUpdate();
    };

    render() {
        let rowMetadata = {
            'bodyCssClassName': (rowData) => {
                let stardart = 'data-row';
                return rowData.selected ? 
                    cx(stardart, 'selected') : stardart;
            }
        }

        return (
            <div ref='wrapper' tabIndex={0}
                 className={cx(this.classes.wrapper, this.props.className)}
                 onBlur={this.onBlur}
                 onContextMenu={this.onContextMenu}
                 onKeyDown={this.onKeyDown}>

                <Griddle ref={'table'}
                         results={this.state.pageData}
                         columnMetadata={this.props.columns}
                         tableClassName={cx('table', 'table-striped')}
                         useGriddleStyles={false}
                         onRowClick={this.onRowClick}
                         rowMetadata={rowMetadata}
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

                {this.props.children}
            </div>
        );
    }

}
