export let alphabetSorter = {
    /**
     * Alphabet sorter func for objects
     * @param {string} sortProp - property to sort on
     * @return {number} -1/0/1
     */
    getComparer(sortProp) {
        return (item1, item2) => {
            let item1str = String(item1[sortProp]);
            let item2str = String(item2[sortProp]);

            if (item1str > item2str) {
                return 1;
            }

            if (item1str < item2str) {
                return -1;
            }

            return 0;
        };
    }
};

export let numericSorter = {
    /**
     * Numeric sorter func for objects
     * @param {string} sortProp - property to sort on
     * @return {number} -1/0/1
     */
    getComparer(sortProp) {
        return (item1, item2) => {
            return parseInt(item1[sortProp], 10) - 
                   parseInt(item2[sortProp], 10);
        };
    }
};