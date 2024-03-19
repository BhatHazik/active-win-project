





















const activeWin = require("active-win");
const fs = require("fs");
const CDP = require("chrome-remote-interface");

const filePath = "processes.json";

let startTime = Date.now(); // Global variable to track start time
const updateTime = 5000; // Update time interval in milliseconds

const getUrl = async () => {
  try {
    const client = await CDP();

    // Extract necessary domains
    const { Page, Runtime } = client;

    // Enable necessary domains
    await Promise.all([Page.enable(), Runtime.enable()]);

    // Evaluate script to get current URL
    const result = await Runtime.evaluate({
      expression: "window.location.href",
    });

    await client.close();
    return result.result.value;
  } catch (err) {
    console.error("Error:", err);
  }
};

const storeData = async (appData) => {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }

    try {
      const jsonData = JSON.parse(data);
      const existingIndex = jsonData.findIndex(
        (entry) => entry.processName === appData.processName
      );
      if (existingIndex !== -1) {
        const prevAppData = jsonData[existingIndex];
        const timeSpent = Math.floor((Date.now() - startTime) / 60000); // Convert milliseconds to minutes and round down
        prevAppData.timeSpent += timeSpent;
      } else {
        jsonData.push(appData);
      }

      let d = JSON.stringify(jsonData, null, 2);
      fs.writeFileSync(filePath, d);
    } catch (parseError) {
      console.error("Error parsing JSON data:", parseError);
    }
  });
};

async function monitorActiveWindow() {
  try {
    const activeWindow = await activeWin();
    const appData = {};

    const activeAppName = activeWindow.owner.name;
    if (
      activeAppName.includes("Google Chrome") &&
      activeWindow.platform === "windows"
    ) {
      const url = await getUrl();
      appData.url = url;
    }

    appData.activeWindow = activeWindow.title;
    appData.processName = activeWindow.owner.name;
    appData.timeStart = new Date().toLocaleString();

    // Store the data for the previous app
    if (Object.keys(appData).length !== 0) {
      storeData(appData);
    }

    startTime = Date.now(); // Update start time for the current app
  } catch (error) {
    console.error("Error occurred:", error);
  }

  setTimeout(monitorActiveWindow, updateTime); // Call the function again after updateTime
}

setTimeout(monitorActiveWindow, updateTime); // Initial call to start the monitoring after updateTime


















































// const activeWin = require("active-win");
// const fs = require("fs");
// const CDP = require("chrome-remote-interface");

// const filePath = "processes.json";

// let startTime = Date.now(); // Global variable to track start time
// const updateTime = 5000; // Update time interval in milliseconds

// const getUrl = async () => {
//   try {
//     const client = await CDP();

//     // Extract necessary domains
//     const { Page, Runtime } = client;

//     // Enable necessary domains
//     await Promise.all([Page.enable(), Runtime.enable()]);

//     // Evaluate script to get current URL
//     const result = await Runtime.evaluate({
//       expression: "window.location.href",
//     });

//     await client.close();
//     return result.result.value;
//   } catch (err) {
//     console.error("Error:", err);
//   }
// };

// const storeData = async (appData) => {
//   fs.readFile(filePath, "utf8", (err, data) => {
//     if (err) {
//       console.error("Error reading file:", err);
//       return;
//     }

//     try {
//       const jsonData = JSON.parse(data);
//       const existingIndex = jsonData.findIndex(
//         (entry) => entry.processName === appData.processName
//       );
//       if (existingIndex !== -1) {
//         const prevAppData = jsonData[existingIndex];
//         const timeSpent = (Date.now() - startTime) / 60000; // Convert milliseconds to minutes
//         prevAppData.timeSpent += timeSpent;
//       } else {
//         jsonData.push(appData);
//       }

//       let d = JSON.stringify(jsonData);
//       fs.writeFileSync(filePath, d);
//     } catch (parseError) {
//       console.error("Error parsing JSON data:", parseError);
//     }
//   });
// };

// async function monitorActiveWindow() {
//   try {
//     const activeWindow = await activeWin();
//     const appData = {};

//     const activeAppName = activeWindow.owner.name;
//     if (
//       activeAppName.includes("Google Chrome") &&
//       activeWindow.platform === "windows"
//     ) {
//       const url = await getUrl();
//       appData.url = url;
//     }

//     appData.activeWindow = activeWindow.title;
//     appData.processName = activeWindow.owner.name;
//     appData.timeStart = new Date().toLocaleString();

//     // Store the data for the previous app
//     if (Object.keys(appData).length !== 0) {
//       storeData(appData);
//     }

//     startTime = Date.now(); // Update start time for the current app
//   } catch (error) {
//     console.error("Error occurred:", error);
//   }

//   setTimeout(monitorActiveWindow, updateTime); // Call the function again after updateTime
// }

// setTimeout(monitorActiveWindow, updateTime); // Initial call to start the monitoring after updateTime
