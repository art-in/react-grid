import React from 'react';
import {css} from '../helpers/react-helpers';

import itemsApi from '../api/items';
import ItemList from './ItemList';

@css({
    main: {
        border: '1px solid lightgray',
        width: '900px',
        margin: '10px auto'
    },
    itemlist: {}
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

    onItemEditing = item => {
        console.log(`item editing: ${JSON.stringify(item)}`);
    };

    onItemEdit = item => {
        console.log(`item edited: ${JSON.stringify(item)}`);
    };

    render() {
        return (
            <main className={this.classes.main}>
                <ItemList items={this.state.items}
                    className={this.classes.itemlist}
                    onItemsDelete={this.onItemsDelete}
                    onItemEditing={this.onItemEditing}
                    onItemEdit={this.onItemEdit} />
            </main>
        );
    }
}