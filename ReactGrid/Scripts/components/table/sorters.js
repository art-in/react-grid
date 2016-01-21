export function alphabetSorter (sortProp) {
    return (item1, item2)  => {
        let item1str = '' + item1[sortProp];
        let item2str = '' + item2[sortProp];

        if (item1str > item2str) {
            return 1;
        }

        if (item1str < item2str) {
            return -1;
        }

        return 0;
    }
}

export function numericSorter (sortProp) {
    return (item1, item2)  => {
        return parseInt(item1[sortProp]) - parseInt(item2[sortProp]);
    }
}