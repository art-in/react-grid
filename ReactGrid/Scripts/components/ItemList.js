import React from 'react'
import DataTable from './table/DataTable'
import ContextMenu from './menu/ContextMenu'
import $ from 'jquery'
import {css} from '../helpers/react-helpers'
import {alphabetSorter, numericSorter} from './table/sorters'
import cx from 'classnames'
import TextColumn from './table/columns/TextColumn'
import NumberColumn from './table/columns/NumberColumn'

@css({
    list: {}
})
export default class ItemList extends React.Component {

    static propTypes = {
        items: React.PropTypes.array.isRequired,
        onItemsDelete: React.PropTypes.func.isRequired,
        onItemEdit: React.PropTypes.func.isRequired
    };

    state = {
        contextMenu: {
            shown: false,
            pos: {
                x: null,
                y: null
            },
            targetItems: []
        }
    };

    classes = this.props.sheet.classes;

    onTableContextMenu = (pos, items) => {
        let {contextMenu} = this.state;

        contextMenu.shown = true;
        contextMenu.pos = pos;
        contextMenu.targetItems = items;

        this.forceUpdate();
    };

    hideContextMenu = () => {
        this.state.contextMenu.shown = false;
        this.forceUpdate();
    };

    onContextMenuAction = type => {
        let {contextMenu} = this.state;

        let targetItemsStr = contextMenu.targetItems.map(i => i.Id).join(', ');

        switch (type) {
            case 'MultAction':
                alert(`action for multiple rows: ${targetItemsStr}`);
                break;
            case 'SingAction':
                alert(`action for single row: ${targetItemsStr}`);
                break;
            case 'Delete':
                this.props.onItemsDelete(contextMenu.targetItems);
                break;
            default:
                throw Error(`Unknown context menu action: ${type}`);
        }

        // hide context menu
        contextMenu.shown = false;

        this.forceUpdate();
    };

    onTableRowEdit = item => {
        this.props.onItemEdit(item);
    };

    render() {
        let {contextMenu} = this.state;

        return (
            <DataTable data={this.props.items}
                columns={[{
                        columnName: 'Id',
                        cssClassName: 'col-md-3',
                        sorter: numericSorter('Id'),
                        initialSort: true,
                        customComponent: NumberColumn
                    }, {
                        columnName: 'Name',
                        cssClassName: 'col-md-9',
                        customComponent: TextColumn
                }]}
                className={cx(this.classes.list, this.props.className)}
                paging={false}
                onContextMenu={this.onTableContextMenu}                
                onRowSelected={this.hideContextMenu}
                onAllRowsDeselected={this.hideContextMenu}
                onAllRowsSelected={this.hideContextMenu}
                onBlur={this.hideContextMenu}
                onRowEdit={this.onTableRowEdit}>
                
                {contextMenu.shown &&
                        <ContextMenu ref="contextMenu"
                            pos={contextMenu.pos}
                            menuItems={ 
                                contextMenu.targetItems.length > 1 ?
                                    [{
                                        title: 'multiple item selected',
                                        onClick: () => this.onContextMenuAction('MultAction')
                                    }, {
                                        title: 'delete',
                                        onClick: () => this.onContextMenuAction('Delete')
                                    }] :
                                    [{
                                        title: 'single item selected',
                                        onClick: () => this.onContextMenuAction('SingAction'),
                                    }, {
                                        title: 'delete',
                                        onClick: () => this.onContextMenuAction('Delete')
                                    }]
                            }/>
                }

            </DataTable>
        )
    }
}