import React from 'react'
import ItemList from './ItemList'
import itemsApi from '../api/items'
import {css} from '../helpers/react-helpers'

@css({
    main: {
        border: '1px solid green',
        width: '900px',
        margin: '0 auto'
    }
})
export default class App extends React.Component {

    classes = this.props.sheet.classes;

    state = {
        items: []
    };

    componentDidMount() {
        itemsApi.get()
            .then(data => { this.setState({items: data}) });
    }

    onItemsDelete = (itemsToDelete) => {
        let itemIdsToDeleteStr = itemsToDelete.map(i => i.Id).join(', ');
        
        if (confirm(`Delete items (${itemIdsToDeleteStr})?`)) {
            this.state.items = this.state.items.filter(i => {
                return !itemsToDelete.includes(i);
            });
            this.forceUpdate();
        }
    };

    render() {
        return (
            <main className={this.classes.main}>
                <ItemList items={this.state.items}
                          onItemsDelete={this.onItemsDelete} />
            </main>
        );
    }
}