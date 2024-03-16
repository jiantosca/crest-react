import { Storage } from "../support/storage";

export function setupTestData() {
    
    Storage.clearAll();

    Storage.storeOAuths([
        {
            id: 'crest sleep 1000 expires 10 Seconds',
            method: 'POST',
            url: 'http://localhost:8080/crest-api/test/oauth.token?sleep=1000&expires=10',
            headers: [{
                name: 'content-type', value: 'application/x-www-form-urlencoded'
            }],
            body: 'client_id=crest&client_secret=crestpassword&grant_type=client_credentials'
        }, {
            id: 'crest sleep 2000 expires 5 mins',
            method: 'POST',
            url: 'http://localhost:8080/crest-api/test/oauth.token?sleep=2000&expires=300',
            headers: [{
                name: 'content-type', value: 'application/x-www-form-urlencoded'
            }],
            body: 'client_id=crest&client_secret=crestpassword&grant_type=client_credentials'
        }, {
            id: 'crest sleep 9000 expires 5 mins',
            method: 'POST',
            url: 'http://localhost:8080/crest-api/test/oauth.token?sleep=9000&expires=300',
            headers: [{
                name: 'content-type', value: 'application/x-www-form-urlencoded'
            }],
            body: 'client_id=crest&client_secret=crestpassword&grant_type=client_credentials'
        }, {
            id: 'crest sleep 3000 bad password',
            method: 'POST',
            url: 'http://localhost:8080/crest-api/test/oauth.token?sleep=3000&expires=300',
            headers: [{
                name: 'content-type', value: 'application/x-www-form-urlencoded'
            }],
            body: 'client_id=crest&client_secret=bad password&grant_type=client_credentials'
        }
    ]);

    Storage.storeHeaders([
        "Accept: */json",
        "Accept: application/json",
        "Accept: application/ld+json",
        "Accept: application/xhtml+xml",
        "Accept: application/xml",
        "Accept: image/gif",
        "Accept: image/jpeg",
        "Accept: image/png",
        "Accept: image/webp",
        "Accept: multipart/form-data",
        "Accept: text/html",
        "Accept: text/plain",
        "Content-Type: application/json",
        "Content-Type: application/x-www-form-urlencoded",
        "Content-Type: application/ld+json",
        "Content-Type: application/xhtml+xml",
        "Content-Type: application/xml",
        "Content-Type: image/gif",
        "Content-Type: image/jpeg",
        "Content-Type: image/png",
        "Content-Type: image/webp",
        "Content-Type: multipart/form-data",
        "Content-Type: text/html",
        "Content-Type: text/plain",
        "another: random one",
        "another: test",
        "random: header",
        "test: header",
        "test: one"
      ]);

    Storage.storeUrls([
        "https://service.tiaa-cref.org/private/api/ext-deposit-accounts-rs-v1/api/bank-users/4684729/deposit-accounts?mask=false&userinfo=true",
        "http://localhost:8080/crest-api/test-mine-type-param?mock=json.json",
        "http://localhost:8080/crest-api/test-redirect?mock=json.json",
        "http://localhost:8080/crest-api/test/oauth-protected?sleep=1000",
        "http://localhost:8080/crest-api/test/oauth-protected?sleep=5000",
        "http://localhost:8080/crest-api/test/oauth.token?sleep=1000&expires=10",
        "http://localhost:8080/crest-api/test?mock=json-large.json&sleep=2000",
        "http://localhost:8080/crest-api/test?mock=json-small.json",
        "http://localhost:8080/crest-api/test?mock=json-small.json&sleep=2000",
        "http://localhost:8080/crest-api/test?mock=json-small.json&sleep=5000",
        "http://localhost:8080/crest-api/test?mock=json.json",
        "http://localhost:8080/crest-api/test?mock=json.json&contentType",
        "http://localhost:8080/crest-api/test?mock=json.json&contentType=application/json",
        "http://localhost:8080/crest-api/test?mock=json.json&contentType=application/json;charset=UTF-8",
        "http://localhost:8080/crest-api/test?mock=json.json&contentType=application/vnd.whatever+json",
        "http://localhost:8080/crest-api/test?mock=json.json&extraHeaderCount-10",
        "http://localhost:8080/crest-api/test?mock=json.json&extraHeaderCount=10",
        "http://localhost:8080/crest-api/test?mock=json.json&extraHeaderCount=20",
        "http://localhost:8080/crest-api/test?mock=json.json&sleep=0",
        "http://localhost:8080/crest-api/test?mock=json.json&sleep=1000",
        "http://localhost:8080/crest-api/test?mock=json.json&sleep=1500",
        "http://localhost:8080/crest-api/test?mock=json.json&sleep=3000",
        "http://localhost:8080/crest-api/test?mock=json.json&sleep=4000",
        "http://localhost:8080/crest-api/test?mock=json.json&sleep=500",
        "http://localhost:8080/crest-api/test?mock=json.json&sleep=700",
        "http://localhost:8080/crest-api/test?mock=json.json&sleep=900",
        "http://localhost:8080/crest-api/test?mock=json.json&sleep=920",
        "http://localhost:8080/crest-api/test?mock=json.json&sleep=980",
        "http://localhost:8080/crest-api/test?mock=json.json&sleep=999",
        "http://localhost:8080/crest-api/test?mock=openapi-spec-with-ref.json",
        "http://localhost:8080/crest-api/test?mock=openapi-spec-with-ref.json&removeNewLines=false",
        "http://localhost:8080/crest-api/test?mock=openapi-spec-with-ref.json&removeNewLines=true",
        "http://localhost:8080/crest-api/test?mock=precision.json",
        "http://localhost:8080/crest-api/test?mock=precision.json&sleep=1500",
        "http://localhost:8080/crest-api/test?mock=xml-one-line.xml",
        "http://localhost:8080/crest-api/test?mock=xml-one-line.xml&sleep=4000",
        "http://localhost:8080/crest-api/test?mock=xml.xml",
        "https://expired.badssl.com/"
      ]);      
}