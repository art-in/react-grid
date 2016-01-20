export function alphabetSorter (sortProp) {
    return (item1, item2)  => {
        return item1[sortProp] > item2[sortProp];
    }
}

export function numericSorter (sortProp) {
    return (item1, item2)  => {
        return parseInt(item1[sortProp]) > parseInt(item2[sortProp]);
    }
}