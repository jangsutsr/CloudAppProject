const https = require('https');
const doc = require('dynamodb-doc');

exports.handler = function(event, context, callback) {
    // TODO implement
    // test getNormAddr
    getNormAddr(event, function(err, address) {
        console.log("test part: " + JSON.stringify(address));
        callback(err, address);
    });
};

// get normalized address
function getNormAddr(item, callback) {
    // set auth-id and auth-token
    var id = '1a121d57-acec-669e-5f64-c413e1cd****';
    var token = '0eBxLrzCLDYDZm77****';
    var titleString = 'https://us-street.api.smartystreets.com/street-address?';
    var tileString  = "&'%20-H%20%22Content-Type:%20application/json";
    
    // check if the input item contains every field
    if (item.city === undefined || item.number === undefined || item.street === undefined
    || item.state === undefined || item.zipcode === undefined) {
        console.log('Lost some fields');
        callback(new Error('400 Invalid address: Lost some fields'), null);
    } else {
        // use SmartyStreet API and get the barcode from the response
        // create corresponding street string
        var streetArr = item.street.split(' ');
        var streetStr = '';
        for (var i in streetArr) {
            streetStr += streetArr[i] + '%20';
        }
        streetStr = streetStr.substring(0, streetStr.length-3);
        
        // create corresponding city string
        var cityArr = item.city.split(' ');
        var cityStr = '';
        for (var j in cityArr) {
            cityStr += cityArr[j] + '%20';
        }
        cityStr = cityStr.substring(0, cityStr.length-3);
        
        // create the url string
        var urlString = titleString + "auth-id=" + id + "&auth-token=" + token
                        + "&street=" + item.number + "%20" + streetStr + "&city="
                        + cityStr + "&state=" + item.state + tileString;
        
        https.get(urlString, function(res) {
            console.log("Got response: " + res.statusCode);
            res.on('data', function(d) {
                process.stdout.write(d);
                console.log('data: ' + d);
                var obj = JSON.parse(d);
                if (obj[0] === undefined) {
                    console.log('get response failed');
                    callback(new Error('400 Invalid address'), null);
                } else {
                    var resAddress = {};
                    resAddress.barcode = obj[0]["delivery_point_barcode"];
                    resAddress.components = obj[0]["components"];
                    console.log('code: ' + JSON.stringify(resAddress.addressBarcode));
                    console.log('components: ' + JSON.stringify(resAddress.addressComponents));
                    callback(null, resAddress);
                }
            });
        }).on('error', function(e) {
            console.log("Got error: " + e.message);
            callback(new Error('500 Failed to get address, err: ' + e.message), null);
        });
    }
}

