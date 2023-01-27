function saveToLocalStorage(city) {
    let favorites = getLocalStorage();
    if (!favorites.some(item => item.lat === city.lat)) {
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

function removeFromLocalStorage(index) {
    let favorites = getLocalStorage();
    // let cityIndex = favorites.indexOf(city);
    console.log(index);
    favorites.splice(index, 1);
    localStorage.setItem('Favorites', JSON.stringify(favorites));
}

export { saveToLocalStorage, getLocalStorage, removeFromLocalStorage };