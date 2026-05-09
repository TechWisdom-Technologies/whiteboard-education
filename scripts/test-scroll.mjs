import puppeteer from 'puppeteer';

const url = 'https://en.your-uni.com/university/taylor-university-malaysia/bachelor-of-computer-science-honours/';

(async () => {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log(`Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // Try calling the function directly
    const success = await page.evaluate(() => {
        if (typeof scrollToSection === 'function') {
            scrollToSection('course-overview-section');
            return true;
        }
        return false;
    });
    
    console.log('Called scrollToSection:', success);
    await new Promise(r => setTimeout(r, 3000));
    
    // Check if element exists
    const text = await page.evaluate(() => {
        const el = document.getElementById('course-overview-section');
        return el ? el.innerText : null;
    });

    console.log('Overview text:', text ? text.substring(0, 500) : 'NULL');

    // Also take a screenshot to see what's rendering
    await page.screenshot({ path: 'g:/TECHWISDOM/Clients/world-class-aid/scripts/test.png' });
    console.log('Saved screenshot to test.png');

    await browser.close();
})();
