export default {

    get() {
        return fetch('api/items', {
            headers: {
                // FF: default content type is xml
                accept: 'application/json'}})
            .then(data => data.json());
    }

};