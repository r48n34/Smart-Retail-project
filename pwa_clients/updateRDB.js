function uploadBlock() {

    var data = { ...infoBlock }; //request body

    console.log(data);

    fetch(serverLocation + '/updateBlock', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: new Headers({ 'Content-Type': 'application/json' })
    })
    .then(function (response) {
        return response.text();
    })
    .then(function (e) {
        console.log("success upload");
    })
    .catch(function (err) {
        console.log(err);
    });

}