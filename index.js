window.onload = function () {
    const host = window.location.host;
    let path = window.location.pathname;
    if (path.endsWith('index.html')) {
        path = path.substr(path, path.length - 'index.html'.length);
    }
    const instanceId = Math.random().toString(36).substring(2, 15);
    const url = `https://play.workadventu.re/_/${instanceId}/${host}${path}map.tmj`;
    document.getElementById('testMapURL').href = url;
    document.getElementById('testMapBtnURL').href = url;
    document.getElementById('testMapURL').innerText = url;

    const tmjURL = window.location.protocol + '//' + window.location.host + path + 'map.tmj';
    document.getElementById('tmjURL').innerText = tmjURL;

    const gettingStartedLink = 'https://workadventu.re/getting-started?name=Map&mapUrl=' + tmjURL;
    document.getElementById('gettingStartedLink').href = gettingStartedLink;

};