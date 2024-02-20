export const loadImage = (map, name, url) => {
    return new Promise((resolve, reject) => {
        map.loadImage(url, (err, image) => {
            if (err) {
                reject(err);
            }

            map.addImage(name, image, { sdf: true });
            resolve();
        });
    });
}

// LineLayer の緯線経線データを返す。
export const latlonlineGeoJson = (() => {
    const d = 1;  // [°]。
    const dlon = 10;  // [°]。
    const dlat = 10;  // [°]。

    const geojson = {
        type: "FeatureCollection",
        features: [],
    };

    // 経線
    for (let lon = 180; -180 < lon; lon -= dlon) {
        const coordinates = [];
        for (let lat = -80; lat <= 80; lat += d) {
            coordinates.push([lon, lat]);
        }

        const feature = {
            type: "Feature",
            id: geojson.features.length,
            geometry: { type: 'LineString', coordinates: coordinates },
            properties: {},
            info: `${Math.abs(lon)}°${(lon < 0) ? 'W' : 'E'}`
        };
        geojson.features.push(feature);
    }

    // 緯線
    for (let lat = -80; lat < 90; lat += dlat) {
        const coordinates = [];
        for (let lon = -180; lon <= 180; lon += d) {
            coordinates.push([lon, lat]);
        }

        const feature = {
            type: "Feature",
            id: geojson.features.length,
            geometry: { type: 'LineString', coordinates: coordinates },
            properties: {},
            info: `${Math.abs(lat)}°${(lat < 0) ? 'S' : 'N'}`
        };
        geojson.features.push(feature);
    }

    return geojson;
})();

export const hsvToRgb = (H, S, V) => {
    var C = V * S;
    var Hp = H / 60;
    var X = C * (1 - Math.abs(Hp % 2 - 1));

    var R, G, B;
    if (0 <= Hp && Hp < 1) { [R, G, B] = [C, X, 0] };
    if (1 <= Hp && Hp < 2) { [R, G, B] = [X, C, 0] };
    if (2 <= Hp && Hp < 3) { [R, G, B] = [0, C, X] };
    if (3 <= Hp && Hp < 4) { [R, G, B] = [0, X, C] };
    if (4 <= Hp && Hp < 5) { [R, G, B] = [X, 0, C] };
    if (5 <= Hp && Hp < 6) { [R, G, B] = [C, 0, X] };

    var m = V - C;
    [R, G, B] = [R + m, G + m, B + m];

    R = Math.floor(R * 255);
    G = Math.floor(G * 255);
    B = Math.floor(B * 255);

    return [R, G, B];
}

export const toRgb = (array) => {
    return `rgb(${array[0]}, ${array[1]}, ${array[2]})`;
}

// ゼロパディング
export const padding = (value, digit) => {
    return (Array(digit).join('0') + value).slice(-digit);
}
