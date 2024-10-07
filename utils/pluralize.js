export const pluralize = (singularText, pluralText, count, zeroText = 'Nothing to show') => {
    switch (count) {
        case 0:
            return zeroText;
        case 1:
            return `${count} ${singularText}`;
    
        default:
            return `${count} ${pluralText}`;
    }
}