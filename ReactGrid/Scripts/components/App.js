import React from 'react';
import {css} from '../helpers/react-helpers';

import itemsApi from '../api/items';
import ItemList from './ItemList';

@css({
    main: {
        border: '1px solid green',
        width: '900px',
        margin: '0 auto'
    },
    itemlist: {
        'max-height': '300px',
        'overflow-y': 'auto'
    }
})
export default class App extends React.Component {

    classes = this.props.sheet.classes;

    state = {
        items: []
    };

    componentDidMount() {
        itemsApi.get()
            .then(data => this.setState({items: data}));
    }

    onItemsDelete = itemsToDelete => {
        let itemIdsToDeleteStr = itemsToDelete.map(i => i.Id).join(', ');
        
        if (confirm(`Delete items (${itemIdsToDeleteStr})?`)) {
            this.state.items = this.state.items.filter(i => {
                return !itemsToDelete.includes(i);
            });
            this.forceUpdate();
        }
    };

    onItemEdit = item => {
        alert(`item edited: ${JSON.stringify(item)}`);
    };

    render() {
        return (
            <main className={this.classes.main}>
                <ItemList items={this.state.items}
                    className={this.classes.itemlist}
                    onItemsDelete={this.onItemsDelete}
                    onItemEdit={this.onItemEdit} />
            </main>
        );
    }
}