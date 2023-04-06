/**
* Клиента для отправки запросов по протоколу http
*/
function HttpClient() {
    const self = this;  

    function constructor() {       
        
    }      
    
    self.sendPostBodyAsync = function (actionUrl, data) {
        let requestHeaders = [{
            name: 'content-type',
            value: 'application/json'
        }];

        const payload = JSON.stringify(data);

        let promise = sendPostWithRequestHeadersAsync(actionUrl, payload, requestHeaders)
        return promise;
    }

    self.sendPostFormAsync = function (actionUrl, data) {
        let requestHeaders = [{
            name: 'content-type',
            value: 'application/x-www-form-urlencoded; charset=UTF-8'
        }];

        let payload = '';
        let ampersand = '';

        Object.keys(data).forEach((key) => {
            payload += `${ampersand}${key}=${data[key]}`
            ampersand = '&';
        });

        let promise = sendPostWithRequestHeadersAsync(actionUrl, payload, requestHeaders)

        return promise;
    }

    function sendPostWithRequestHeadersAsync(actionUrl, payload, arrayRequestHeaders) {
        return new Promise(function (resolve, reject) {
            const xhr = new XMLHttpRequest();
            const url = `${_baseAddress}/${actionUrl}`;

            xhr.open("POST", url);

            for (let requestHeader of arrayRequestHeaders) {
                xhr.setRequestHeader(requestHeader.name, requestHeader.value);
            }

            xhr.onload = (e) => {
                if (xhr.status === 200) {
                    let result = JSON.parse(xhr.response);
                    resolve(result);
                } else {
                    reject({ status: xhr.status, statusText: xhr.statusText });
                }
            };

            xhr.onerror = (e) => {
                reject({ status: xhr.status, statusText: xhr.statusText });
            };

            xhr.send(payload);

        });
    }

    constructor();
}