import puppeteer from "puppeteer";

const BROWSER_WS = "wss://brd-customer-hl_51812ad0-zone-scraping_browser1:is8e3n2bn56b@brd.superproxy.io:9222";

export const getBrowser = async () => {
    let browser;
    let page;
    try {
        browser = await puppeteer.connect({ browserWSEndpoint: BROWSER_WS });
        page = await browser.newPage();
        page.setDefaultNavigationTimeout(2 * 60 * 1000);

        // **Wait for the API response** and return the data
        const responsePromise = new Promise((resolve, reject) => {
            page.on("response", async (response) => {
                const url = response.url();
                if (url.includes("getDayCoordinatesII")) {
                    try {
                        const responseBody = await response.json(); // Parse JSON
                        resolve(responseBody); // Return the parsed response
                    } catch (error) {
                        reject("Failed to parse response as JSON:", error);
                    }
                }
            });
        });

        // Navigate to the target page
        await page.goto("https://mcdonline.nic.in/esbm-mcd/citizenMap/getDayCoordinatesII?vehicleRegNo=DL1GC7925&startTime=06:00:00&endTime=21:47:56&date=03-02-2025");

        console.log("Page loaded successfully");

        // Wait for the API response
        const scrapedData = await responsePromise;
        return scrapedData;

    } catch (error) {
        console.error("Error:", error.message);
        return null;
    } finally {
        if (page) await page.close();
        if (browser) await browser.close();
    }
};
