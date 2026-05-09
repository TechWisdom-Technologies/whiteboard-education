import puppeteer from 'puppeteer';

const url = 'https://en.your-uni.com/university/taylor-university-malaysia/cambridge-a-level-3-subjects/';

(async () => {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log(`Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    
    // Check if btn-course-overview exists and click it
    await page.evaluate(() => {
        const btn = document.querySelector('#btn-course-overview');
        if (btn) btn.click();
    });
    
    await new Promise(r => setTimeout(r, 2000));
    
    const data = await page.evaluate(() => {
        const result = { overviewText: null, entryRequirementsText: null, careerOutcomes: null };
        
        // Find all collapses
        const items = document.querySelectorAll('.course-details-item-collapse');
        items.forEach(item => {
            const btn = item.querySelector('.course-details-item-collapse-btn');
            const btnText = btn ? btn.innerText.toLowerCase() : '';
            const body = item.querySelector('.course-details-item-collapse-body');
            const bodyText = body ? body.innerText.trim() : '';
            
            if (btnText.includes('overview') || btnText.includes('description')) {
                result.overviewText = bodyText;
            } else if (btnText.includes('entry requirement')) {
                result.entryRequirementsText = bodyText;
            } else if (btnText.includes('career') || btnText.includes('future')) {
                result.careerOutcomes = bodyText;
            }
        });
        
        // Alternative: If it's not in a collapse but just text inside #course-overview-section
        if (!result.overviewText) {
            const ovSection = document.getElementById('course-overview-section');
            if (ovSection) {
                // Ignore curriculum section inside it
                const curriculum = ovSection.querySelector('#course-curriculum-section');
                if (curriculum) curriculum.remove();
                result.overviewText = ovSection.innerText.trim();
            }
        }
        
        return result;
    });
    
    console.log('Results:', data);
    await browser.close();
})();
