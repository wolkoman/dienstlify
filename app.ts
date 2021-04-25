import {DOMParser} from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts';

const [SESSION_ID, TELEGRAM_API_TOKEN, TELEGRAM_CHAT_ID] = Deno.args;

const dienststellenIds = [9, 16,17, 18];
const send = (text:string) => fetch(`https://api.telegram.org/bot${TELEGRAM_API_TOKEN}/sendMessage`, {
  method: "POST",
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({'chat_id': TELEGRAM_CHAT_ID, text })
}).then(x => x.text())

const toName = (value:string) => value === "Gesperrt!" || value === "Rücksprache mit Mannschaft" ||value === "" || value === " Eintragen" ? null : value;
const fetchPage = ({dienststellenId, month, year}:{dienststellenId: number, month: number, year: number}) =>
  fetch(
    `https://intranet-md.n.roteskreuz.at/intern/?itemid=87&id=${dienststellenId}&month=${month}&year=${year}`,
    {headers: {Cookie: `PHPSESSID=${SESSION_ID}`}}
    )
  .then(x => x.arrayBuffer())
  .then(buffer => {
    let decoder = new TextDecoder("iso-8859-1");
    return decoder.decode(buffer);
  })
  .then(x => new DOMParser().parseFromString(x, "text/html"))
  .then(doc => ({
    title: doc?.querySelector("legend")?.textContent,
    days: Array.from(doc?.querySelector('.table-responsive tbody')?.children ?? [])
      .map(x => x?.children)
      .map(x => ({day: x[0].textContent, startTime: x[2].textContent.split(" - ")[0], driver: toName(x[4].textContent), san1: toName(x[5].textContent), san2: toName(x[6].textContent) }))
  }))

const dates = Array(3)
  .fill(0)
  .map((_, index) => new Date(new Date().setMonth(new Date().getMonth() + index)))
  .map(date => ({year: date.getFullYear(), month: date.getMonth()+1}))

Promise.all(
  dates
    .flatMap(date => dienststellenIds.map(dienststellenId => ({...date, dienststellenId})))
    .map(obj => fetchPage(obj))
).then(pages => pages
  .flatMap(page => page.days.map(day => ({...day, title: page.title})))
  .filter(duty => duty.driver && (!duty.san1 || !duty.san2))
  .sort((a,b) => a.day.split("").reverse().join("").localeCompare(b.day.split("").reverse().join("")))
  .map(duty => `${duty.day} ${duty.startTime} ${duty.title} ${duty.driver?.split(" ")[0]} ${duty.san1?.split(" ")[0]} ${duty.san2?.split(" ")[0]}`).join("\n\n")
)
  .then(data => {
    console.log(data);
    send(data);
  });