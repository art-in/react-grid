import React from 'react'
import ReactDOM from 'react-dom'
import Griddle from 'griddle-react'
import {css} from '../../helpers/react-helpers'
import $ from 'jquery'
import cx from 'classnames'
import {alphabetSorter} from './sorters'

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
        results: [],
        currentPage: 0,
        maxPages: 0,
        externalResultsPerPage: 5,
        externalSortColumn: null,
        externalSortAscending: true
    };

    classes = this.props.sheet.classes;

    componentWillReceiveProps(nextProps) {
        let {data, columns} = nextProps;

        if (!nextProps.showRowSelection) {
            data.forEach(i => {delete i.selected});
        }
        
        let {externalResultsPerPage, currentPage, externalSortAscending} = this.state;
        
        // sort
        let columnData = columns.find(c => c.initialSort);
        let sortColumn;
        if (columnData) {
            sortColumn = columnData.columnName;
            let sortedData = data.sort(columnData.sorter || alphabetSorter(sortColumn));

            if(externalSortAscending === false){
                sortedData.reverse();
            }

            data = sortedData;
        }

        // page
        var startRowIdx = currentPage === 0 ?
            0 :
            currentPage * externalResultsPerPage;
        
        let pageRows = data.slice(startRowIdx,
            startRowIdx + externalResultsPerPage > data.length ?
                data.length : 
                startRowIdx + externalResultsPerPage);

        let pagesCount = Math.round(
            data.length > externalResultsPerPage ?
                data.length / externalResultsPerPage :
                1);

        this.setState({
            results: pageRows,
            currentPage: currentPage,
            maxPages: pagesCount,
            externalSortColumn: sortColumn
        });
    }

    componentWillMount() {
        let {data} = this.props;
    }

    onRowClick = (rowComponent, e) => {
        let row = rowComponent.props.data;
        
        let {data} = this.props;
        let {contextMenu} = this.state;

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

            if (e.shiftKey) {
                
            }

            // select target row
            row.selected = !rowSelected;

            this.props.onRowSelected();
        }

        this.forceUpdate();
    };

    onContextMenu = e => {

        console.log(this.props.data);

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

    //what page is currently viewed
    setPage = (pageNumber) => {
        console.log(`setPage - ${pageNumber || 0}`)
        let {externalResultsPerPage} = this.state;
        
        var startRowIdx = !pageNumber ?
            0 :
            pageNumber * externalResultsPerPage;
        
        let pageRows = this.props.data.slice(startRowIdx,
            startRowIdx + externalResultsPerPage > this.props.data.length ?
                this.props.data.length : 
                startRowIdx + externalResultsPerPage);

        this.setState({
            results: pageRows,
            currentPage: pageNumber
        });
    };

    //this will handle how the data is sorted
    sortData = (sortProp, sortAscending, data) => {
        console.log(`sortData - ${sortProp} - ${sortAscending}`)
        //sorting should generally happen wherever the data is coming from
        let columnData = this.props.columns.find(c => c.columnName === sortProp);
        let sortedData = data.sort(columnData.sorter || alphabetSorter(sortProp));

        if(sortAscending === false){
            sortedData.reverse();
        }
        return {
            currentPage: 0,
            externalSortColumn: sortProp,
            externalSortAscending: sortAscending,
            results: sortedData.slice(0, this.state.externalResultsPerPage)
        };
    };

    //this changes whether data is sorted in ascending or descending order
    changeSort = (sort, sortAscending) => {
        console.log(`changeSort - ${sort} - ${sortAscending}`)
        this.setState(this.sortData(sort, sortAscending, this.props.data));
    };

    //this method handles the filtering of the data
    setFilter = (filter) => {
        console.log(`setFilter - ${filter}`)
    };

    //this method handles determining the page size
    setPageSize = (size) => {
        console.log(`setPageSize - ${size}`)

        let {data} = this.props;

        let pagesCount = Math.round(
            data.length > size ? data.length / size : 1);

        this.setState({
            currentPage: 0,
            externalResultsPerPage: size,
            maxPages: pagesCount,
            results: data.slice(0, size)
        });
    };

    render() {
        return (
            <div onContextMenu={this.onContextMenu}>

                <Griddle ref={'table'}
                         results={this.state.results}
                         columnMetadata={this.props.columns}
                         tableClassName={cx('table', 'table-striped', this.classes.table)}
                         useGriddleStyles={false}
                         onRowClick={this.onRowClick}
                         rowMetadata={this.rowMetadata}
                         showFilter={false}
                         showSettings={false}
                         showPager={true}
                         
                         useExternal={true} 
                         externalSetPage={this.setPage}
                         externalChangeSort={this.changeSort}
                         externalSetFilter={this.setFilter}
                         externalSetPageSize={this.setPageSize}

                         externalMaxPage={this.state.maxPages}
                         resultsPerPage={this.state.externalResultsPerPage}
                         externalCurrentPage={this.state.currentPage} 
                         externalSortColumn={this.state.externalSortColumn} 
                         externalSortAscending={this.state.externalSortAscending}/>
            </div>
        );
    }

}