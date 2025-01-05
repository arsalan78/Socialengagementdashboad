sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../controller/GraphsLogic",
    "../controller/langflowclient2"
], (Controller, GraphsLogic, langflowclient) => {
    "use strict";

    return Controller.extend("socialint.controller.View1", {
        onInit() {

            // Starting of changes for main 
            var mainset = {
                rows: []
            }
            var omainmodel = new sap.ui.model.json.JSONModel(mainset);
            this.getView().setModel(omainmodel, "mainModel");



            this.setcurrentDate();
            this.getastadb();
        },

        setcurrentDate: function () {
            var currentDate = null;
            var date = new Date();
            var day = date.getDate();
            var weekday = new Array(
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday"
            );
            const monthNames = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "June",
                "July",
                "Aug",
                "Sept",
                "Oct",
                "Nov",
                "Dec",
            ];
            var dayOfWeek = weekday[date.getDay()];
            // var month = date.getMonth() + 1;
            var month = date.toLocaleString("default", { month: "long" });
            var year = date.getFullYear();

            // This arrangement can be altered based on how we want the date's format to appear.
            currentDate = `${day} ${month} ${year},${dayOfWeek}`;
            this.byId("TxtCurrent").setText(currentDate);
        },
        getastadb: function () {
            debugger;
            var that = this;
            $.ajax({
                url: 'https://' + '7529e152-dc09-4e04-8155-590a3bcdedd2' + '-' + 'us-east1' + '.apps.astra.datastax.com/api/rest/v2/keyspaces/' + 'keyspace_social' + "/user_posts_new/rows",
                method: 'get',
                headers: {
                    'x-cassandra-token': 'AstraCS:jKsWREZHYADtEvBpHMZBJMsy:26c1196ca9dbadd55bea33d12880cb46524e3681cdd27f274d0be6b155acec65'
                },
                contentType: 'application/json',
                crossDomain: true,
                // data: 'select * from keyspace_social.user_posts_new;'
            }).done(function (response) {
                console.log(response);
                debugger;

                // Initialize an empty Set to store unique user IDs
                let uniqueUserIds = new Set();

                // Loop through each item in the dataset
                response.data.forEach(item => {
                    // Add the userid to the Set (duplicates will be automatically handled)
                    uniqueUserIds.add(item.userid);
                });

                // Convert the Set back to an array of objects
                let usersset = Array.from(uniqueUserIds).map(userid => ({ userid }));                // console.log(users);

                that.getView().getModel("mainModel").setProperty("/users", usersset);
                that.getView().getModel("mainModel").setProperty("/respData", response.data);
            });
        },

        ondropdownselect: function (oevt) {
            var selectedID = parseInt(oevt.getSource().getValue(), 10)
            debugger;
            var graphdata = this.getView().getModel("mainModel").getData().respData;
            this.byId("spacer2").setVisible(true);
            this.byId("spacer3").setVisible(false);
            this.byId("insightbox").setVisible(false);

            func_3Dpie(graphdata, selectedID);
            multiplecols(graphdata, selectedID);

            // this.byId("graphcell").setVisible(false);

            var unfortext = calculateEngagements(graphdata, selectedID);
            var fortxt = formatEngagementsAsText(unfortext)
            var inst = "This is the data :" + fortxt; //+"Provide your analysis.Also include points in over all engagement where overall engagment formula is( Saves+Likes+Shares+Comments_) per postype. Format as neat and clean possible to for end user to interpert easily.'"
            this.onRunFlow(inst);

        },
        onRunFlow: async function (dataprompt) {

            var that = this;
            const inputValue = dataprompt; // Get this from your UI5 input field
            const inputType = 'chat';
            const outputType = 'chat';
            const stream = false; // or true if you want to enable streaming

            const flowIdOrName = 'd3683dac-c6ff-42f4-aea0-d999d325968e';
            const langflowId = '782aa084-227e-4681-a548-d0c5a38856a9';
            const applicationToken = 'AstraCS:GEIOhBzUCQXZjOWgGUeJiyRQ:f518743baf325a3cc6922f6b6d4352931f186bda71c02308986b0cbdde4d83c7';
            const langflowClient = new LangflowClient('https://api.langflow.astra.datastax.com', applicationToken);

            try {
                const tweaks = {
                    "AIMLModel-iVh9B": {},
                    "ChatOutput-67PqP": {},
                    "ChatInput-y92zB": {},
                    "Prompt-wD7tJ": {}
                };

                const response = await langflowClient.runFlow(
                    flowIdOrName,
                    langflowId,
                    inputValue,
                    inputType,
                    outputType,
                    tweaks,
                    stream,
                    (data) => console.log("Received:", data.chunk), // onUpdate
                    (message) => console.log("Stream Closed:", message), // onClose
                    (error) => console.log("Stream Error:", error) // onError
                );

                if (!stream && response && response.outputs) {
                    const flowOutputs = response.outputs[0];
                    const firstComponentOutputs = flowOutputs.outputs[0];
                    const output = firstComponentOutputs.outputs.message;

                    // MessageToast.show("Final Output: " + output.message.text);
                    that.byId("insightbox").setVisible(true);
                    this.byId("graphcell").setVisible(true);
                    that.byId("insighttext").setText(output.message.text);


                }
            } catch (error) {
                debugger;
                console.error('Main Error', error.message);
                that.byId("insighttext").setText(error.message);
                that.byId("insightbox").setVisible(true);
                // this.byId("graphcell").setVisible(true);
                // MessageToast.show("Error: " + error.message);
            }
        }

    });
});