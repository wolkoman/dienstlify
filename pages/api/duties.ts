import {NextApiRequest, NextApiResponse} from 'next';
import * as jsdom from 'jsdom';
import iconv from 'iconv-lite';

export default async (req: NextApiRequest, res: NextApiResponse) => {

  const dienststellenIds = [9, 13, 16, 17, 18];
  const monthsInAdvance = 3;

  const toName = (value: string) => ['Gesperrt!', 'Rücksprache mit Mannschaft', '', ' Eintragen'].includes(value) ? null : value;
  const pad2 = (str: any) => Array(2 - str.toString().length).fill(0).join('') + str;
  const toDate = (dateObject: { year: number, month: number, day: number }) => `${dateObject.year}-${pad2(dateObject.month)}-${pad2(dateObject.day)}`;

  const fetchPage = ({dienststellenId, month, year}: { dienststellenId: number, month: number, year: number }) =>
    fetch(
      `https://intranet-md.n.roteskreuz.at/intern/?itemid=87&id=${dienststellenId}&month=${month}&year=${year}`,
      {headers: {Cookie: `PHPSESSID=${req.query.token};`}}
    )
      .then(response => response.arrayBuffer())
      .then(buffer => iconv.decode(new Buffer(buffer), 'iso-8859-1'))
      .then(html => new jsdom.JSDOM(html).window.document)
      .then(document => ({
        title: document?.querySelector('legend')?.textContent,
        days: Array.from(document?.querySelector('.table-responsive tbody')?.children ?? [])
          .map(x => Array.from(x?.children))
          .map(x => ({
            day: +(x[0].textContent.split('.')[0]),
            month, year,
            startTime: x[2].textContent.split(' - ')[0],
            driver: toName(x[4].textContent),
            san1: toName(x[5].textContent),
            san2: toName(x[6].textContent),
          }))
      }));

  const dates = Array(monthsInAdvance)
    .fill(0)
    .map((_, index) => new Date(new Date().setMonth(new Date().getMonth() + index)))
    .map(date => ({year: date.getFullYear(), month: date.getMonth() + 1}))

  await Promise.all(
    dates
      .flatMap(date => dienststellenIds.map(dienststellenId => ({...date, dienststellenId})))
      .map(obj => fetchPage(obj))
  ).then(pages => pages
    .flatMap(page => page.days.map(day => ({...day, title: page.title.replace('RTW-C ', '')})))
    .sort((a, b) => toDate(a).localeCompare(toDate(b)))
  )
    .then(data => res.json(data))
    .catch(message => res.json(message));
}
