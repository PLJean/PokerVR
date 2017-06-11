export function subsets(array, k) {
    let subsetsList = [];
    function subsetRecurse(array, combo, n, k, i) {
        if (i <= n) {
            if (combo.length == k) {
                subsetsList.push(combo);
            }

            else {
                {
                    let newCombo = combo.slice();
                    subsetRecurse(array, newCombo, n, k, i + 1);
                }

                {
                    let newCombo = combo.slice();
                    newCombo.push(array[i]);
                    subsetRecurse(array, newCombo, n, k, i + 1);
                }
            }
        }
    }
    subsetRecurse(array, [], array.length, k, 0);
    return subsetsList;
}

export function sum(array: number[]) {
    return array.reduce(function (sum, num) {
        return sum + num;
    });
}