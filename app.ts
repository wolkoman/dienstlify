import {DOMParser} from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts';
import { config } from "https://deno.land/x/dotenv/mod.ts";

const send = (text:string) => fetch(`https://api.telegram.org/bot${config().telegramApiToken}/sendMessage`, {
  method: "POST",
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({'chat_id': config().chatId, text })
}).then(x => x.text()).then(console.log);

const toName = (value:string) => value === "Gesperrt!" || value === "R�cksprache mit Mannschaft" ||value === "" || value === " Eintragen" ? null : value;
const fetchPage = ({dienststellenId, month, year}:{dienststellenId: number, month: number, year: number}) =>
  fetch(
    `https://intranet-md.n.roteskreuz.at/intern/?itemid=87&id=${dienststellenId}&month=${month}&year=${year}`,
    {headers: {Cookie: `PHPSESSID=${config().sessionId}`}}
    )
  .then(x => x.text())
  .then(x => new DOMParser().parseFromString(x, "text/html"))
  .then(doc => ({
    title: doc?.querySelector("legend")?.textContent,
    days: Array.from(doc?.querySelector('.table-responsive tbody')?.children ?? [])
      .map(x => x?.children)
      .map(x => ({day: x[0].textContent, startTime: x[2].textContent.split(" - ")[0], driver: toName(x[4].textContent), san1: toName(x[5].textContent), san2: toName(x[6].textContent) }))
  }))

const dienststellenIds = [9, 16,17, 18];

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
