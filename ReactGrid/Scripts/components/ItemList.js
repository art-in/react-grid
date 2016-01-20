import React from 'react'
import ReactDOM from 'react-dom'
import DataTable from './table/DataTable'
import ContextMenu from './menu/ContextMenu'
import $ from 'jquery'

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

    onFocus = e => {
        this.state.showItemSelection = true;
    };

    onBlur = e => {
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
                 onFocus={this.onFocus}
                 onBlur={this.onBlur}>

                <DataTable data={this.props.items}
                           columns={['Id', 'Name']}
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