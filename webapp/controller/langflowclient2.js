class LangflowClient {
    constructor(baseURL, applicationToken) {
        this.baseURL = baseURL;
        this.applicationToken = applicationToken;
    }

    post(endpoint, body) {
        debugger;
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            "Authorization": `Bearer ${this.applicationToken}`,
            "Content-Type": "application/json"
        };

        return new Promise((resolve, reject) => {
            var proxy = 'https://cors-anywhere.herokuapp.com/';

            $.ajax({
                url:   url,
                type: 'POST',
                headers: headers,
                data: JSON.stringify(body),
                // mode: 'no-cors',
                success: function(response) {
                    debugger;
                    resolve(response);
                },
                error: function(xhr, status, error) {
                    reject(new Error(`${xhr.status} ${xhr.statusText} - ${xhr.responseText}`));
                }
            });
        });
    }

    initiateSession(flowId, langflowId, inputValue, inputType = 'chat', outputType = 'chat', stream = false, tweaks = {}) {
        const endpoint = `/lf/${langflowId}/api/v1/run/${flowId}?stream=${stream}`;
        return this.post(endpoint, { input_value: inputValue, input_type: inputType, output_type: outputType, tweaks: tweaks });
    }

    handleStream(streamUrl, onUpdate, onClose, onError) {
        const eventSource = new EventSource(streamUrl);

        eventSource.onmessage = event => {
            const data = JSON.parse(event.data);
            onUpdate(data);
        };

        eventSource.onerror = event => {
            console.error('Stream Error:', event);
            onError(event);
            eventSource.close();
        };

        eventSource.addEventListener("close", () => {
            onClose('Stream closed');
            eventSource.close();
        });

        return eventSource;
    }

    async runFlow(flowIdOrName, langflowId, inputValue, inputType = 'chat', outputType = 'chat', tweaks = {}, stream = false, onUpdate, onClose, onError) {
        try {
            const initResponse = await this.initiateSession(flowIdOrName, langflowId, inputValue, inputType, outputType, stream, tweaks);
            console.log('Init Response:', initResponse);
            if (stream && initResponse && initResponse.outputs && initResponse.outputs[0].outputs[0].artifacts.stream_url) {
                const streamUrl = initResponse.outputs[0].outputs[0].artifacts.stream_url;
                console.log(`Streaming from: ${streamUrl}`);
                this.handleStream(streamUrl, onUpdate, onClose, onError);
            }
            return initResponse;
        } catch (error) {
            console.error('Error running flow:', error);
            onError('Error initiating session');
        }
    }
}

// Export the class so it can be imported in other files
// export default LangflowClient;
