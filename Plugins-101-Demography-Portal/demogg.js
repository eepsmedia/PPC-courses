
const statusDIV = document.getElementById("status");
const getDataButton = document.getElementById("buttonGetData");
const theBaseURL = "https://d6wn6bmjj722w.population.io:443/1.0/population/1980/Brazil/";

let statusGuts = "click the button to retrieve data";   //  this is a message that gets put on the screen.

/**
 * This gets called from the html when the window is loaded.
 * We set everything up, make all our connections.
 *
 * @returns {Promise<void>}
 */
export async function initialize() {
    console.log(`initializing demographics plugin`);

    //  initialize the connection to CODAP
    await codapInterface.init(iFrameDescription);       //  make the iFrame
    await pluginHelper.initDataSet(datasetSetupObject);   //  make the dataset
    getDataButton.addEventListener("click", doGetData); //  connect the button to a function

    cycle();    //   call this to update the screen
}


/**
 * Call this to update the screen.
 *
 * We do this in response to anything that happens--user input, outside event, whatever.
 *
 * The philosophy here is to redraw everything that can possibly change!
 * This method can therefore get complicated, and I always move it to a separate file (module).
 *
 * @returns {Promise<void>}
 */
async function cycle() {
    statusDIV.innerHTML = statusGuts;       //  update the "status" area with statusGuts.
}

/**
 * Called when the "get data" button is pushed (see the addEventListener call in initialize() above)
 *
 * @returns {Promise<void>}
 */
async function doGetData() {
    let newData = await getDataFromSite();              //      goes to population.io and gets data  (JSON)
    await emitData(newData);                            //      put this data into a CODAP dataset
    statusGuts = `you got ${newData.length} records`;   //      we will change what appears on the screen
    cycle();                                            //      redraw (and put up the new statusGuts)
}

/**
 * Actually get the data from the URL.
 * @returns {Promise<any>}
 */
async function getDataFromSite() {
    const response = await fetch(theBaseURL);   //  a fancy structure to receive the contents of the URL
    const theText = await response.text();          //  extract the text of the response
    const theJSON = JSON.parse(theText);                    //  convert that text into a JSON object
    return theJSON;
}

/**
 * Use the CODAP API to emit the data into CODAP itself.
 * The key is a "values" array, each element of which is an object that corresponds to a case.
 * Those key-value pairs are attribute names and their associated values.
 *
 * Fortunately, that's exactly what the demography site gives us.
 * Usually, you will have to do some translation!
 *
 * @param iData     the array of case-data objects, passed in from above
 *
 * @returns {Promise<void>}
 */
async function emitData(iData) {

    try {
        const res = await pluginHelper.createItems(iData, datasetSetupObject.name);     //  the second argument is the dataset name
    } catch (msg) {
        console.log(`Problem emitting transaction to CODAP: ${msg}`);
    }
}

/**
 * CODAP needs a very specific format for this object,
 * which specifies the dataset you will make.
 *
 * There are all sorts of options you can read about in the API;
 * this is a fully functional -- but very simple -- example.
 *
 * @type {{collections: [{name: string, attrs: [{name: string, type: string},{name: string, type: string},{name: string, type: string},{name: string, type: string},{name: string, type: string},null]}], name: string, title: string}}
 */
const datasetSetupObject = {
    name: "demogg",        //      the name (not title) of the dataset
    title: "demographic data",     //  this appears at the top of the table
    collections: [     //  there is just one collection (hierarchical level)
        {
            name: "years",      //  this is the label above the data
            attrs: [        //  this is the list of attributes.
                {name: "country", type: "categorical"},
                {name: "year", type: "numeric"},
                {name: "age", type: "numeric"},
                {name: "females", type: "numeric"},
                {name: "males", type: "numeric"},
                {name: "total", type: "numeric"}
            ]
        }
    ]
}

/**
 * CODAP uses this to format the "iFrame," the box your plugin lives in.
 *
 * @type {{name: string, title: string, version: string, dimensions: {width: number, height: number}}}
 */
const iFrameDescription = {
    name: "demogg",         //  this is a unique name that does not appear!
    title: "demographics plugin",       //  this appears in the title bar of the plugin
    version: "0.001",           //  this appears in the title bar of the plugin
    dimensions: {width: 256, height: 192},      //      dimensions,
}
