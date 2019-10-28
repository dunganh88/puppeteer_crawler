const HCCrawler = require('headless-chrome-crawler');
const CSVExporter = require('headless-chrome-crawler/exporter/csv');
const JSONLineExporter = require('headless-chrome-crawler/exporter/json-line');

const URL = ['https://www.vietnamworks.com/viec-lam-it-phan-mem-i35-vn','https://www.vietnamworks.com/viec-lam-it-phan-cung-mang-i55-vn']

const FILE = 'link_jobs.json';

const exporter = new JSONLineExporter({
    file: FILE,
    fields: ['result'],
});



(async () => {
    const crawler = await HCCrawler.launch({
        headless :false,
        exporter,
        customCrawl : async (page,crawl) =>{
            const result = await crawl();
            const totalLinkJob = []
            while(true){
                console.log('aaaaaa')
                await page.screenshot({path:"test.png", fullPage:true})
                //get link job in page
                totalLinkJob.push(...await getLinkJobs(page))
                console.log(totalLinkJob.length)
                if(await nextList(page)){
                    console.log("next done !!!")
                }
                else {
                    break;
                }
            }

            //loai cac phan tu trung lap
            result.result = [...new Set(totalLinkJob)]
            return result;
        },
        maxConcurrency: 1,
        onSuccess: result => {
            console.log(result.result.length);
        },
    });
    await crawler.queue({url:URL[0],retryCount : 0});
    await crawler.onIdle();
    await crawler.close();
})();

// gia lap thao tac click next list 
async function nextList(page){
    try {
        // const selectorClosePopup = '#popover-close-link';
        let elementNextList = await page.$('#pagination-container > div > ul > li.ais-pagination--item.ais-pagination--item__next > a')
        if(elementNextList == null){
            elementNextList = await page.$('#pagination-container > div > ul > li:nth-child(11) > span');
        }
        // console.log(elementNextList)
        const text = await page.evaluate(el => el.innerText,elementNextList)
        if(text === "›"){
            await page.evaluate( el => el.click(),elementNextList);
            return true
        }
        else{
            return false;
        }
    } catch (error) {
        // console.log(error);
        console.log('failed to click or done have anything :))');
        return false;
    }
}



async function getLinkJobs(page){
    const listLinks = []
    const element_jobs = await page.$$('a.job-title')
    for (let el of element_jobs){
        const linkJob = await page.evaluate(el => el.href,el);
        // console.log(linkJob)
        listLinks.push(linkJob)
    }
    return listLinks;
}