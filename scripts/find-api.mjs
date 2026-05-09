/**
 * Deep debug - try different approaches to load the overview content
 */
import puppeteer from 'puppeteer';

const url = 'https://en.your-uni.com/university/taylor-university-malaysia/bachelor-of-computer-science-honours/';

const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

// Intercept ALL network requests
page.on('response', async (response) => {
    const resUrl = response.url();
    const contentType = response.headers()['content-type'] || '';
    if ((contentType.includes('json') || contentType.includes('html')) && 
        !resUrl.includes('google') && !resUrl.includes('hotjar') && !resUrl.includes('gtm') &&
        !resUrl.includes('recaptcha') && !resUrl.includes('analytics')) {
        console.log(`[Network] ${response.status()} ${contentType.substring(0,20)} ${resUrl.substring(0, 120)}`);
        try {
            const body = await response.text();
            if (body.length > 100 && body.length < 50000) {
                // Check if this contains overview text
                if (body.toLowerCase().includes('overview') && body.toLowerCase().includes('programme') || body.toLowerCase().includes('program')) {
                    console.log(`  >>> POSSIBLE OVERVIEW DATA (${body.length} chars) <<<`);
                    console.log(body.substring(0, 1000));
                }
            }
        } catch(e) {}
    }
});

console.log('Navigating...');
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

// Wait and then try to trigger the overview tab via JS
console.log('\nWaiting 5 seconds...');
await new Promise(r => setTimeout(r, 5000));

// Try clicking the overview button via JS
console.log('Clicking overview tab via JS...');
await page.evaluate(() => {
    const btn = document.querySelector('#btn-course-overview');
    if (btn) {
        console.log('Found button, clicking...');
        btn.click();
    } else {
        console.log('Button not found');
    }
    
    // Also try calling the scrollToSection function directly
    if (typeof scrollToSection === 'function') {
        scrollToSection('course-overview-section');
    }
});

// Wait for content to load after click
console.log('Waiting 5 more seconds for content to load...');
await new Promise(r => setTimeout(r, 5000));

// Check the DOM now
const content = await page.evaluate(() => {
    return {
        bodyLen: document.body.innerHTML.length,
        bodyText: document.body.innerText,
        overviewSection: document.getElementById('course-overview-section')?.innerHTML || 'NOT FOUND',
        allIds: Array.from(document.querySelectorAll('[id]')).map(el => el.id).filter(Boolean)
    };
});

console.log('\n=== All IDs on page ===');
console.log(content.allIds.join(', '));

console.log('\n=== Overview Section HTML ===');
console.log(content.overviewSection.substring(0, 2000));

console.log('\n=== Full Body Text ===');
console.log(content.bodyText);

await browser.close();
