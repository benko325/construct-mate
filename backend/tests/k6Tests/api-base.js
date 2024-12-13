const apiBaseUrl = __ENV.URL || 'https://localhost:7199/';

export class ApiBase {
    constructor() {
        this.baseUrl = apiBaseUrl;
        this.header = {
            'Content-Type': 'application/json'
        };
        this.params = {
            headers: this.header
        };
    }
}