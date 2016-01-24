import React from 'react'
import DataTable from './table/DataTable'
import ContextMenu from './menu/ContextMenu'
import $ from 'jquery'
import {css} from '../helpers/react-helpers'
import {alphabetSorter, numericSorter} from './table/sorters'
import cx from 'classnames'

@css({
    list: {
        outline: 'none'
    }
})
export default class ItemList extends React.Component {

    static propTypes = {
        items: React.PropTypes.array.isRequired,
        onItemsDelete: React.PropTypes.func.isRequired
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

    onTableBlur = () => {
        this.state.contextMenu.shown = false;
        this.forceUpdate();
    };

    onTableRowSelected = () => {
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

    render() {
        let {contextMenu} = this.state;

        return (
            <DataTable data={this.props.items}
                columns={[{
                    columnName: 'Id',
                    cssClassName: 'col-md-3',
                    sorter: numericSorter('Id'),
                    initialSort: true
                    }, {
                    columnName: 'Name',
                    cssClassName: 'col-md-9'
                }]}
                className={cx(this.classes.list, this.props.className)}
                paging={false}
                onRowSelected={this.onTableRowSelected}
                onContextMenu={this.onTableContextMenu}
                onBlur={this.onTableBlur}>
                
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