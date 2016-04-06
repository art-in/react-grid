import React from 'react';
import ReactDOM from 'react-dom';
import Griddle from 'griddle-react';
import $ from 'jquery';
import cx from 'classnames';

import {css} from '../../helpers/react-helpers';
import {alphabetSorter} from './sorters';

@css({
    wrapper: {
        // to get row offset relative to wrapper,
        // for appropriate scrolling
        'position': 'relative',

        '&:focus': {
            outline: '2px solid #84b2ff'
        },
        
        '&:not(:focus) .table tbody tr:not(.editing).selected': {
            // fade row selection color when focus out
            'background-color': '#669ADA'
        },

        '& .griddle-body > div': {
            // remove static scrollbar that is added
            // by griddle infinite scrolling
            'overflow-y': 'auto !important'
        },

        '& .table': {
            // disable selection (for batch selection with shift)
            'user-select': 'none',
            'border': '1px solid lightgray',

            // rewrite bootstrap
            'margin-bottom': '0',

            '& th, & td': {
                'border-right': '1px solid lightgray'
            },
            '& thead': {
                'background-color': '#a6a6a6',
                'color': 'white',

                '& th': {
                    'font-weight': 'normal',

                    '&:hover': {
                        cursor: 'pointer'
                    } 
                }
            },
            '& tbody + tbody': {
                // griddle somewhy renders two tbody
                display: 'none'
            },
            '& tbody': {
                '& tr': {
                    '&:hover': {
                        'background-color': '#f3f3f3',
                        'cursor': 'pointer'
                    },
                    '&:not(.editing).selected': {
                        'background-color': '#538dd5',
                        'color': 'white'
                    },
                    '&.editing': {
                        'background-color': '#F1F1F1',

                        '& input, & select': {
                            'color': 'black',
                            'background-color': 'white',
                            'border': 'none',
                            'width': '100%'
                        }
                    }
                },
                '& td': {
                    'padding': '2px 5px',
                    'white-space': 'nowrap',
                    'max-width': '320px',
                    'overflow': 'hidden'
                }
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
        },
        '& .griddle-nodata': {
            'padding': '10px',
            'text-align': 'center'
        }
    }
})
export default class DataTable extends React.Component {

    static propTypes = {
        data: React.PropTypes.arrayOf(React.PropTypes.shape({
            selected: React.PropTypes.bool,
            editing: React.PropTypes.bool,
            ['new']: React.PropTypes.bool,
            active: React.PropTypes.bool
        })).isRequired,
        columns: React.PropTypes.arrayOf(React.PropTypes.shape({
            columnName: React.PropTypes.string.isRequired,
            cssClassName: React.PropTypes.string,
            sorter: React.PropTypes.shape({
                getComparer: React.PropTypes.func.isRequired
            }),
            initialSort: React.PropTypes.bool,
            customComponent: React.PropTypes.func
        })).isRequired,
        paging: React.PropTypes.bool,
        noDataMessage: React.PropTypes.string,
        batchSelect: React.PropTypes.bool,
        keyProp: React.PropTypes.string,
        optimization: React.PropTypes.shape({
            height: React.PropTypes.shape({
                absolute: React.PropTypes.number,
                // window relative (0-1)
                relative: React.PropTypes.number
            }).isRequired,
            rowHeight: React.PropTypes.number.isRequired
        }),
        deselectRowsOnBlur: React.PropTypes.bool,
        filter: React.PropTypes.string,
        showFilter: React.PropTypes.bool,
        onContextMenu: React.PropTypes.func.isRequired,
        onRowSelected: React.PropTypes.func.isRequired,
        onAllRowsSelected: React.PropTypes.func.isRequired,
        onAllRowsDeselected: React.PropTypes.func.isRequired,
        onBlur: React.PropTypes.func.isRequired,
        onRowEditing: React.PropTypes.func,
        onRowEdit: React.PropTypes.func,
        onRowAdding: React.PropTypes.func,
        onRowsDeleting: React.PropTypes.func
    };

    static defaultProps = {
        paging: true,
        noDataMessage: 'No data to display',
        batchSelect: true,
        keyProp: 'Id',
        optimization: null,
        deselectRowsOnBlur: true,
        filter: null,
        showFilter: false,
        onRowEditing() {},
        onRowEdit() {},
        onRowAdding() {},
        onRowsDeleting() {}
    };

    state = {
        columns: [],
        columnMetadata: [],
        
        pageData: [],
        pageCurrent: 0,
        pageSize: 5,
        pagesCount: 0,
        sortColumnName: null,
        sortAscending: true,
        filter: null,

        // currently selected row
        activeRowData: null,
        
        // prev data of currently beeing edited row
        editingRowPrevData: null,

        // dom element of cell to focus on edit
        editingRowCell: null
    };

    isComponentMounted = false;
    classes = this.props.sheet.classes;

    clone(obj) {
        // clone (simple edition)
        return JSON.parse(JSON.stringify(obj));
    }

    componentWillMount() {
        this.handleProps(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.handleProps(nextProps);
    }

    handleProps(props) {

        // columns
        this.state.columns = props.columns
            .filter(c => c.visible === undefined || c.visible)
            .map(c => c.columnName);
        
        this.state.columnMetadata = props.columns;

        this.state.columnMetadata.forEach(column => {
            if (column.editable && !column.customComponent) {
                console.warn(
                    `Column '${column.columnName}' is editable, ` +
                    `but does not have custom component.`);
            }
        });

        // page
        if (!props.paging) {
            this.state.pageSize = Infinity;
        }
        
        // sort
        let sortColumnName = this.state.sortColumnName;
        if (!sortColumnName) {
            // get initial sort column
            let columnData = props.columns.find(c => c.initialSort);
            if (columnData) {
                sortColumnName = columnData.columnName;
            }
        }
        
        // filter
        this.state.filter = props.filter;
        
        // check editing rows count
        let editingRows = props.data.filter(r => r.editing);
        if (editingRows.length > 1) {
            console.warn('More than one row is in editing state');
        }
        
        // preserve prev state of edited row
        let editingRowData = props.data.find(r => r.editing);
        if (editingRowData && !this.state.editingRowPrevData) {
            this.state.editingRowPrevData = 
                this.clone(editingRowData);
        }

        // check height
        if (props.optimization && 
            props.optimization.height.relative && 
            props.optimization.height.absolute) {
            console.warn('Both relative and absolute height specified');
        }

        this.updatePageData(
            props.data,
            this.state.columnMetadata,
            this.state.filter,
            sortColumnName,
            this.state.sortAscending,
            this.state.pageCurrent,
            this.state.pageSize);
    }

    getOptimizationHeight() {
        let height;
        let heightProps = this.props.optimization.height;
        if (heightProps.absolute) {
            height = heightProps.absolute;
        } else if (heightProps.relative) {
            height = $(window).height() * heightProps.relative;
        }

        return height;
    }

    componentDidMount() {
        document.addEventListener('selectstart', this.onDocumentSelectStart);
        window.addEventListener('resize', this.onWindowResize);
        this.isComponentMounted = true;
    }

    componentWillUnmount() {
        document.removeEventListener('selectstart', this.onDocumentSelectStart);
        window.removeEventListener('resize', this.onWindowResize);
        this.isComponentMounted = false;
    }

    onDocumentSelectStart = e => {
        let $wrapper = $(ReactDOM.findDOMNode(this.refs.wrapper));
        let $selectedElement = $(e.target);

        // prevent text selection inside grid, except inputs
        // HACK(IE): text selected on batch row selection with shift, 
        //           ignoring CSS 'user-select'
        if ($wrapper.has($selectedElement).length &&
            !$selectedElement.is('input, select')) {
            e.preventDefault();
        }
    };

    onWindowResize = () => {
        if (this.props.optimization &&
            this.props.optimization.height.relative) {
            // update relative height
            this.forceUpdate();
        }
    };

    /**
     * Applies sorting and paging for the data.
     * @param {array} data - the data
     * @param {array} columnsMetadata - meta in griddle format
     * @param {string} filter - for filtering
     * @param {string} sortColumn - for sorting
     * @param {bool} sortAscending - for sorting
     * @param {number} pageCurrent - current page number
     * @param {number} pageSize - max rows count on page
     */
    updatePageData(
        data, columnsMetadata, filter, 
        sortColumn, sortAscending,
        pageCurrent, pageSize) {

        // filter
        if (filter) {
            // case insensitive
            // shallow
            let filterLowCase = filter.toLowerCase();
            data = data.filter(rowData => {
                let keys = Object.keys(rowData);
                let includes = keys.some(key => {
                    let prop = rowData[key];
                    return prop && prop
                        .toString()
                        .toLowerCase()
                        .includes(filterLowCase);
                });

                if (!includes) {
                    // de-select filtered rows
                    delete rowData.selected;
                }

                return includes;
            });
        }

        // sort
        let columnMetadata = columnsMetadata
            .find(c => c.columnName === sortColumn);

        let comparer = (columnMetadata && 
            columnMetadata.sorter &&
            columnMetadata.sorter.getComparer(columnMetadata.columnName)) ||
            alphabetSorter.getComparer(sortColumn);

        data.sort(comparer);

        if (sortAscending === false) {
            data.reverse();
        }

        // page
        let pagesCount = Math.round(
        data.length > pageSize ?
            Math.ceil(data.length / pageSize) : 1);

        if (pagesCount <= pageCurrent) {
            // go to last page is there is no rows on current one
            pageCurrent = pagesCount - 1;
        }

        var startRowIdx = pageCurrent === 0 ?
            0 :
            pageCurrent * pageSize;

        let lastRowIdx = startRowIdx + pageSize > data.length ?
                data.length : 
                startRowIdx + pageSize;
        
        let pageRows = data.slice(startRowIdx, lastRowIdx);

        this.setState({
            pageData: pageRows,
            pageCurrent: pageCurrent,
            pageSize: pageSize,
            pagesCount: pagesCount,
            sortColumnName: sortColumn,
            sortAscending: sortAscending,
            filter: filter
        });
    }

    onRowClick = (rowComponent, e) => {

        this.onSaveChanges();
        this.props.data.forEach(r => delete r.editing);

        let row = rowComponent.props.data;

        let {contextMenu, doubleClick} = this.state;
        
        // context menu event
        if (contextMenu) {
            delete this.state.contextMenu;

            if (!row.selected) {
                this.props.data.forEach(i => delete i.selected);
            }

            row.selected = true;

            // save target rows
            let selectedRows = this.props.data.filter(row => row.selected);
            this.props.onContextMenu(contextMenu.pos, selectedRows);

        // double click event
        } else if (doubleClick) {
            delete this.state.doubleClick;

            this.state.editingRowCell = doubleClick.target;

            this.props.data.forEach(i => delete i.selected);
            
            row.selected = true;
            row.editing = true;

        // row select event
        } else {
            
            // batch
            let selectedRow = this.props.data.find(r => r.selected);
            if (selectedRow && e.shiftKey && this.props.batchSelect) {
                
                let rowFromIdx = this.props.data.indexOf(selectedRow);
                let rowToIdx = this.props.data.indexOf(row);

                let goForward = rowFromIdx < rowToIdx;

                // select all rows between previously selected and just selected row
                let i = rowFromIdx;
                let done;
                while (!done) {
                    let currentRow = this.props.data[i];
                    currentRow.selected = true;
                    
                    i = goForward ? ++i : --i;
                    done = goForward ? (i > rowToIdx) : (i < rowToIdx);
                }

            // single
            } else {
                let rowSelected = row.selected;

                if (!e.ctrlKey || !this.props.batchSelect) {
                    // de-select all the rows
                    this.props.data.forEach(i => delete i.selected);
                }

                // select target row
                row.selected = !rowSelected;
            }

            this.props.onRowSelected(row);
        }

        this.state.activeRowData = row;
        
        // focus table
        // IE: when selecting row table does not get focused
        $(ReactDOM.findDOMNode(this.refs.wrapper)).focus();

        this.forceUpdate();
    };

    onContextMenu = e => {

        // inside data row only (no header/footer)
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

    onDoubleClick = e => {

        // inside data row only (no header/footer)
        if (!$(e.target).closest('.data-row')[0]) {
            return;
        }

        // handle as double click
        this.state.doubleClick = {
            target: e.target
        };

        // HACK: pass event to react component
        // (no support for double click event for table row from griddle)
        $(e.target).trigger('click');

        e.preventDefault();
    };

    onSetPage = pageNumber => {
        this.updatePageData(
            this.props.data,
            this.state.columnMetadata,
            this.state.filter,
            this.state.sortColumnName,
            this.state.sortAscending,
            pageNumber,
            this.state.pageSize);
    };

    onChangeSort = (sort, sortAscending) => {
        let pageCurrent = this.state.pageCurrent;
        if (sort !== this.state.sortColumnName) {
            // move to first page on sort column change
            pageCurrent = 0;
        }

        this.updatePageData(
            this.props.data,
            this.state.columnMetadata,
            this.state.filter,
            sort,
            sortAscending,
            pageCurrent,
            this.state.pageSize);
    };

    onSetFilter = filter => {
        if (this.props.filter) {
            console.warn('Filter already set through props');
            return;
        }

        this.updatePageData(
            this.props.data,
            this.state.columnMetadata,
            filter,
            this.state.sortColumnName,
            this.state.sortAscending,
            this.state.pageCurrent,
            this.state.pageSize);
    };

    onSetPageSize = size => {
        this.updatePageData(
            this.props.data,
            this.state.columnMetadata,
            this.state.filter,
            this.state.sortColumnName,
            this.state.sortAscending,
            this.state.pageCurrent,
            size);
    };

    onKeyDown = e => {

        let hasEditingRows = this.props.data.some(r => r.editing);

        switch (e.keyCode) {
        case 13:
            // enter
            let selectedRowData = this.props.data.find(r => r.selected);
            if (selectedRowData) {
                if (selectedRowData.editing) {
                    // save edit
                    this.onSaveChanges();

                } else if (this.state.columnMetadata.some(c => c.editable)) {
                    // make editable
                    this.props.data.forEach(r => delete r.selected);
                    this.props.data.forEach(r => delete r.editing);

                    // preserve prev row data
                    this.state.editingRowPrevData = this.clone(selectedRowData);
                    
                    selectedRowData.editing = true;
                    selectedRowData.selected = true;

                    this.props.onAllRowsDeselected();
                    this.props.onRowEditing(selectedRowData);
                }

                this.forceUpdate(); 
            }
            break;
        case 27:
            // esc
            let editingRowData = this.props.data.find(r => r.editing);
            
            if (editingRowData) {

                // exit edit mode
                this.onDiscardChanges();

                this.props.data.forEach(r => delete r.selected);
                this.props.data.forEach(r => delete r.editing);

                // select just edited row
                editingRowData.selected = true;
            } else {
                // de-select all
                this.props.data.forEach(r => delete r.selected);
                this.props.data.forEach(r => delete r.editing);
            
                this.props.onAllRowsDeselected();
            }
            
            this.forceUpdate();
            e.preventDefault();            

            // focus table
            $(ReactDOM.findDOMNode(this.refs.wrapper)).focus();
            break;
        case 38:
            // arrow up
            this.onSaveChanges();
            this.props.data.forEach(r => delete r.editing);
            this.moveNextRow(false, e.shiftKey && this.props.batchSelect);
            e.preventDefault();
            break;
        case 40:
            // arrow down
            this.onSaveChanges();
            this.props.data.forEach(r => delete r.editing); 
            this.moveNextRow(true, e.shiftKey && this.props.batchSelect);
            e.preventDefault();
            break;
        case 45:
        case 107:
            // insert
            // add
            if (!hasEditingRows) {
                this.props.onRowAdding();
                e.preventDefault();
            }
            break;
        case 46:
        case 109:
            // delete
            // subtract
            if (!hasEditingRows) {
                let selectedRows = this.props.data.filter(r => r.selected);
                this.props.onRowsDeleting(selectedRows);
                e.preventDefault();
            }
            break;
        case 65:
            // ctrl+a
            if (e.ctrlKey && this.props.batchSelect) {
                this.props.data.forEach(r => delete r.editing);                

                // select all on current page
                this.props.data.forEach(r => r.selected = true);
                this.props.onAllRowsSelected();
                this.forceUpdate();
                e.preventDefault();
            }
            break;
        default:
            // any other key
        }

    };

    moveNextRow(down, batch) {
        let {data} = this.props;
        let {pageData} = this.state;

        if (!pageData.length) {
            // no rows to select
            return;
        }

        // get selected row index
        let selectedIdx;
        if (pageData.some(r => r.selected)) {
            if (down) {
                // last selected row
                pageData.reverse();
                let firstSelectedIdx = pageData.findIndex(r => r.selected);
                selectedIdx = pageData.length - firstSelectedIdx - 1;
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
            // no move outside current page
            return;
        }

        if (!batch) {
            data.forEach(r => delete r.selected);
        }

        data.forEach(r => delete r.editing);
        
        // get index of row to select next
        let nextToSelectIdx;
        if (selectedIdx === -1) {
            nextToSelectIdx = down ? 0 : pageData.length - 1;
        } else {
            nextToSelectIdx = down ? selectedIdx + 1 : selectedIdx - 1;
        }
        
        let rowToSelect = pageData[nextToSelectIdx];
        
        rowToSelect.selected = true;

        this.props.onRowSelected(rowToSelect);
        this.state.activeRowData = rowToSelect;

        // focus table
        $(ReactDOM.findDOMNode(this.refs.wrapper)).focus();

        this.forceUpdate();
    }

    componentDidUpdate() {
        
        // scroll to make active row visible
        let activeRowData = this.state.activeRowData;
        if (activeRowData) {
            delete this.state.activeRowData;
            
            let $tableNode = $(ReactDOM.findDOMNode(this.refs.table));
            let $scrollerNode;

            let rowHeight;
            let rowOffsetTop;

            if (this.props.optimization) {
                // optimization means that rows outside visible 
                // scroll frame will not be rendered in DOM, but
                // it requires row height to be specified. So we can
                // calculate row position basing on that.
                let rowIdx = this.state.pageData.indexOf(activeRowData);
                let $headerNode = $tableNode.find('table > thead');
                $scrollerNode = $tableNode.find('.griddle-body > div');
                rowHeight = this.props.optimization.rowHeight;
                rowOffsetTop = rowIdx * rowHeight + $headerNode.height();
            } else {
                // otherwise active row should be rendered
                let $rowNode = $tableNode.find('.active-row');
                $scrollerNode = $(ReactDOM.findDOMNode(this.refs.wrapper));
                rowHeight = $rowNode.height();
                rowOffsetTop = $rowNode.position().top;
            }
            
            // scroll from table top
            let scrollTop = $scrollerNode.scrollTop();
            let scrollerHeight = $scrollerNode.height();

            // padding from top and bottom borders of scroll frame
            // for active row (so you always see next row when navigating
            // with arrow keys)
            let padding = 20;

            if (rowOffsetTop < (scrollTop + padding)) {
                // row is above the scroll frame
                $scrollerNode.scrollTop(rowOffsetTop - padding);
            } else {
                let diff = (rowOffsetTop + rowHeight) - 
                    (scrollTop + scrollerHeight) + padding;

                if (this.props.optimization) {
                    // HACK: griddle incorrectly calculates top scroll
                    // so we have to add height of one more row
                    diff += rowHeight;
                }

                if (diff > 0) {
                    // row is below the scroll frame
                    $scrollerNode.scrollTop(scrollTop + diff);
                }
            }
        }

        // focus input in editing row
        let editingRowData = this.props.data.find(r => r.editing);
        if (editingRowData) {
            let $tableNode = $(ReactDOM.findDOMNode(this.refs.table));
            let $editingRowNode = $tableNode.find('.data-row.editing');

            if ($editingRowNode.length === 0) {
                throw Error('Editing row node not found');
            }

            // only focus if no element already focused
            // inside editing row
            if (!$editingRowNode.find(':focus').length) {
            
                // focus input in editing row cell
                let $editingRowCellInput = $editingRowNode
                    .find(this.state.editingRowCell)
                    .find('input, select');
                
                delete this.state.editingRowCell;

                // or just first input in the row
                let $inputToFocus = $editingRowCellInput.length ?
                    $editingRowCellInput :
                    $editingRowNode.find('input, select');

                $inputToFocus.first().focus().select();
            }
        }
    }

    onSaveChanges = () => { 
        let editedRowData = this.props.data.find(r => r.editing);

        // if some row is beeing edited...
        if (editedRowData) {
            // remove flags-junk before sending to event
            delete editedRowData.editing;
            delete editedRowData.selected;

            this.props.onRowEdit(editedRowData);

            // re-sort
            this.updatePageData(
                this.props.data,
                this.state.columnMetadata,
                this.state.filter,
                this.state.sortColumnName,
                this.state.sortAscending,
                this.state.pageCurrent,
                this.state.pageSize);

            editedRowData.selected = true;
            this.state.activeRowData = editedRowData;
            this.state.editingRowPrevData = null;

            // focus table
            $(ReactDOM.findDOMNode(this.refs.wrapper)).focus();
        }
    };

    onDiscardChanges = () => {
        let editingRow = this.props.data.find(r => r.editing);

        // if some row is beeing edited...
        if (editingRow) {
            if (!this.state.editingRowPrevData) {
                throw Error('No prev row data to discard changes');
            }
            
            // rewrite edited row data with previous value
            Object.assign(
                editingRow, 
                this.state.editingRowPrevData);

            // make sure 'editing' flag is in place
            editingRow.editing = true;

            this.state.editingRowPrevData = null;
        }
    };

    onBlur = () => {
        // wait a while to get currently focused element
        // FF: should wait >= 100ms
        setTimeout(() => {
            if (!this.isComponentMounted) {
                // by this time it may be unmounted already
                return;
            }

            let $wrapper = $(ReactDOM.findDOMNode(this.refs.wrapper));
            let $focusedElement = $(document.activeElement);

            // blur if currently focused element is not inside wrapper
            if (!$wrapper.has($focusedElement).length && 
                !$focusedElement.is($wrapper)) {

                // blur
                this.onDiscardChanges();

                if (this.props.deselectRowsOnBlur) {
                    this.props.data.forEach(r => delete r.selected);
                }
                this.props.data.forEach(r => delete r.editing);

                this.props.onBlur();
                this.forceUpdate();
            }
        }, 100);
    };

    render() {
        let rowMetadata = {
            bodyCssClassName: rowData => {
                let stardart = 'data-row';
                return cx(
                    stardart,
                    {['selected']: rowData.selected},
                    {['editing']: rowData.editing},
                    {['active-row']: rowData === this.state.activeRowData});
            },
            // row data property that will be used for key'ing 
            // react row components while rendering
            key: this.props.keyProp
        };

        let optimizationProps = {};
        if (this.props.optimization) {
            // internal griddle render optimization
            // by rendering only rows in visible area
            optimizationProps = {
                enableInfiniteScroll: true,
                bodyHeight: this.getOptimizationHeight(),
                rowHeight: this.props.optimization.rowHeight,
                paddingHeight: 0
            };
        }

        return (
            <div ref='wrapper' tabIndex={0}
                 className={cx(this.classes.wrapper, this.props.className)}
                 onBlur={this.onBlur}
                 onContextMenu={this.onContextMenu}
                 onKeyDown={this.onKeyDown}
                 onDoubleClick={this.onDoubleClick}>

                <Griddle ref={'table'}
                         results={this.state.pageData}
                         columns={this.state.columns}
                         columnMetadata={this.state.columnMetadata}
                         tableClassName={cx('table')}
                         useGriddleStyles={false}
                         onRowClick={this.onRowClick}
                         rowMetadata={rowMetadata}
                         showFilter={this.props.showFilter}
                         showSettings={false}
                         showPager={this.props.paging}
                         noDataMessage={this.props.noDataMessage}
                         
                         {...optimizationProps}
                         
                         // use external datasource for manual
                         // handling of all aspects of paging/sorting/etc.
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
