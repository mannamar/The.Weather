function saveToLocalStorage(city) {
    let favorites = getLocalStorage();
    if (!favorites.includes(city)) {
        favorites.push(city);
    }
    localStorage.setItem('Favorites', JSON.stringify(favorites));
}

function getLocalStorage() {
    let localStorageData = localStorage.getItem('Favorites');
    if (localStorageData === null) {
        return [];
    }
    return JSON.parse(localStorageData);
}

function removeFromLocalStorage(city) {
    let favorites = getLocalStorage();
    let cityIndex = favorites.indexOf(city);
    favorites.splice(cityIndex, 1);
    localStorage.setItem('Favorites', JSON.stringify(favorites));
}

export { saveToLocalStorage, getLocalStorage, removeFromLocalStorage };