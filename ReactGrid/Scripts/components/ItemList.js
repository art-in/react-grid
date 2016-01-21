import React from 'react'
import DataTable from './table/DataTable'
import ContextMenu from './menu/ContextMenu'
import $ from 'jquery'
import {css} from '../helpers/react-helpers'
import {alphabetSorter, numericSorter} from './table/sorters'

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
        showItemSelection: false,
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

    onFocus = e => {
        this.state.showItemSelection = true;
    };

    onBlur = e => {
        if (e.target !== this.refs.wrapper) {
            // table nav buttons can throw 'blur' too
            // interested in table wrapper 'blur' only
            return;
        }
        
        this.state.showItemSelection = false;
        
        // hide context menu
        let {contextMenu} = this.state;
        contextMenu.shown = false;

        this.forceUpdate();
    };

    onTableRowSelected = () => {
        // hide context menu
        let {contextMenu} = this.state;
        contextMenu.shown = false;

        this.forceUpdate();
    };

    onTableContextMenu = (pos, items) => {
        let {contextMenu} = this.state;

        contextMenu.shown = true;
        contextMenu.pos = pos;
        contextMenu.targetItems = items;

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
        let {contextMenu, showItemSelection} = this.state;

        return (
            <div tabIndex='0'
                 className={this.classes.list}
                 onFocus={this.onFocus}
                 onBlur={this.onBlur}
                 ref='wrapper'>

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
                           showRowSelection={showItemSelection}
                           onRowSelected={this.onTableRowSelected}
                           onContextMenu={this.onTableContextMenu} />
            
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
            </div>
        )
    }
}