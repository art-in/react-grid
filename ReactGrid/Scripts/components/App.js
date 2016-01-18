import React from 'react'
import DataTable from './DataTable/DataTable'
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
        tableData: []
    };

    componentDidMount() {
        itemsApi.get()
            .then(data => { this.setState({tableData: data}) });
    }

    render() {
        return (
            <main className={this.classes.main}>
                <DataTable data={this.state.tableData}
                           columns={['Id', 'Name']}/>
            </main>
        );
    }
}