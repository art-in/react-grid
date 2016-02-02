/**
 * Reliable comparer for cases when 
 * target object properties are equal.
 * 
 * @param {object} item1 - first
 * @param {object} item2 - second
 * @return {number} -1/0/1
 */
function hashComparer(item1, item2) {
    let item1str = JSON.stringify(item1);
    let item2str = JSON.stringify(item2);

    if (item1str > item2str) {
        return 1;
    }

    if (item1str < item2str) {
        return -1;
    }

    return 0;
}

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

            return hashComparer(item1, item2);
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
            let item1num = parseFloat(item1[sortProp], 10);
            let item2num = parseFloat(item2[sortProp], 10);

            if (item1num > item2num) {
                return 1;
            }

            if (item1num < item2num) {
                return -1;
            }

            return hashComparer(item1, item2);
        };
    }
};
