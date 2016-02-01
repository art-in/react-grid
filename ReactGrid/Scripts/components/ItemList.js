import React from 'react';
import cx from 'classnames';

import {css} from '../helpers/react-helpers';
import ContextMenu from './menu/ContextMenu';
import ItemType from '../models/ItemType';

import {numericSorter} from './table/sorters';
import DataTable from './table/DataTable';
import TextColumn from './table/columns/TextColumn';
import NumberColumn from './table/columns/NumberColumn';
import SelectColumn from './table/columns/SelectColumn';
import DateColumn from './table/columns/DateColumn';

@css({
    list: {}
})
export default class ItemList extends React.Component {

    static propTypes = {
        items: React.PropTypes.array.isRequired,
        onItemsDelete: React.PropTypes.func.isRequired,
        onItemEditing: React.PropTypes.func.isRequired,
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
        case 'Edit':
            let item = contextMenu.targetItems[0];
            item.editing = true;
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

    onTableRowEditing = item => {
        this.props.onItemEditing(item);
    };

    onTableRowEdit = item => {
        this.props.onItemEdit(item);
    };

    render() {
        let {contextMenu} = this.state;

        let itemTypeOptions = ItemType.map((t, idx) => {
            return {value: idx, displayValue: t};
        });

        let menuAction = actionName => 
            () => this.onContextMenuAction(actionName);

        return (
            <DataTable data={this.props.items}
                columns={[{
                    columnName: 'Id',
                    cssClassName: 'col-md-3',
                    sorter: numericSorter,
                    initialSort: true,
                    customComponent: NumberColumn,
                    editable: true
                }, {
                    columnName: 'Name',
                    cssClassName: 'col-md-3',
                    customComponent: TextColumn,
                    editable: true
                }, {
                    columnName: 'Type',
                    cssClassName: 'col-md-3',
                    sorter: numericSorter,
                    customComponent: SelectColumn,
                    selectOptions: itemTypeOptions,
                    editable: true
                }, {
                    columnName: 'CreatedDate',
                    cssClassName: 'col-md-3',
                    customComponent: DateColumn,
                    editable: true
                }]}
                className={cx(this.classes.list, this.props.className)}
                paging={false}
                onContextMenu={this.onTableContextMenu}                
                onRowSelected={this.hideContextMenu}
                onAllRowsDeselected={this.hideContextMenu}
                onAllRowsSelected={this.hideContextMenu}
                onBlur={this.hideContextMenu}
                onRowEditing={this.onTableRowEditing}
                onRowEdit={this.onTableRowEdit}>
                
                {contextMenu.shown &&
                        <ContextMenu ref='contextMenu'
                        pos={contextMenu.pos}
                        menuItems={ 
                        contextMenu.targetItems.length > 1 ?
                            [{
                                title: 'multiple item selected',
                                onClick: menuAction('MultAction')
                            }, {
                                title: 'delete',
                                onClick: menuAction('Delete')
                            }] :
                            [{
                                title: 'single item selected',
                                onClick: menuAction('SingAction')
                            }, {
                                title: 'edit',
                                onClick: menuAction('Edit')
                            }, {
                                title: 'delete',
                                onClick: menuAction('Delete')
                            }]
                        }/>
                }

            </DataTable>
        );
    }
}