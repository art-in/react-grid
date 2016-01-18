export default {

    get() {
        return fetch('api/items')
            .then(data => data.json());
    }

}