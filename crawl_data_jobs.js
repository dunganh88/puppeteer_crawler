const fs = require('fs');
const HCCrawler = require('headless-chrome-crawler');
const CSVExporter = require('headless-chrome-crawler/exporter/csv');

const FILE = 'resultJobs.csv';

const exporter = new CSVExporter({
    file: FILE,
    fields: ['result.Rank', 'result.Career','result.Skill','result.Benefits','result.Description','result.Requirements'],
    separator: '\t',
});


(async() => {
    const PATH = 'result.json'
    listLinkJobs = await readFile(PATH)
    const crawler = await HCCrawler.launch({
        exporter,
        evaluatePage : (()=>({
            Rank : $('#job-info > div > div.col-md-4.col-sm-12.tab-sidebar > div > div.box-summary.link-list')[0].children[1].getElementsByClassName('content')[0].innerText,
            Career : $('#job-info > div > div.col-md-4.col-sm-12.tab-sidebar > div > div.box-summary.link-list')[0].children[2].getElementsByClassName('content')[0].innerText,
            Skill : $('#job-info > div > div.col-md-4.col-sm-12.tab-sidebar > div > div.box-summary.link-list')[0].children[3].getElementsByClassName('content')[0].innerText,
            Benefits : $('#job-info > div > div.col-md-8.col-sm-12.tab-main-content')[0].getElementsByClassName('benefits')[0].innerText,
            Description : $('#job-info > div > div.col-md-8.col-sm-12.tab-main-content')[0].getElementsByClassName('description')[0].innerText,
            Requirements : $('#job-info > div > div.col-md-8.col-sm-12.tab-main-content')[0].getElementsByClassName('requirements')[0].innerText,
        })),
        onSuccess : (result =>{
            console.log(result.result.length)
        })
    })

    await crawler.queue(listLinkJobs);
    await crawler.onIdle();
    await crawler.close();
})();

async function readFile(path){
    //read links
    let jsonString = fs.readFileSync(path)
    const totalLinkJobs = await JSON.parse(jsonString);
    const distinctLinkJobs = [...new Set(totalLinkJobs.result)]
    console.log(totalLinkJobs.result.length)
    console.log(distinctLinkJobs.length)
    console.log("Read done !!!")
    return distinctLinkJobs;
}
