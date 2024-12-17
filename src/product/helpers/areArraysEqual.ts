export const areArraysEqual = (arr1: string[], arr2: string[]): boolean => {
    if (arr1.length !== arr2.length) return false;
    const sorted1 = arr1.slice().sort();
    const sorted2 = arr2.slice().sort();
    return sorted1.every((val, index) => val === sorted2[index]);
};
