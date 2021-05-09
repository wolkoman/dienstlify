import {NextApiRequest, NextApiResponse} from 'next';
import iconv from 'iconv-lite';
import cheerio from 'cheerio';

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
      .then(html => cheerio.load(html))
      .then(document => ({
        title: document('legend').text(),
        days: Array.from(document('.table-responsive tbody').children())
          .map(x => x.childNodes)
          .map(x => ({
            day: +(document(x[0]).text().split('.')[0]),
            month, year,
            startTime: cheerio(x[2]).text().split(' - ')[0],
            driver: toName(cheerio(x[4]).text()),
            san1: toName(cheerio(x[5]).text()),
            san2: toName(cheerio(x[6]).text()),
          }))
      }))
  ;

  const dates = Array(monthsInAdvance)
    .fill(0)
    .map((_, index) => new Date(new Date().setMonth(new Date().getMonth() + index)))
    .map(date => ({year: date.getFullYear(), month: date.getMonth() + 1}))

  await Promise.all(
    dates
      .flatMap(date => dienststellenIds.map(dienststellenId => ({...date, dienststellenId})))
      .map(obj => fetchPage(obj))
  ).then(pages =>
    pages
      .flatMap(page => page.days.map(day => ({...day, title: page.title.replace('RTW-C ', '')})))
      .sort((a, b) => toDate(a).localeCompare(toDate(b)))
  )
    .then(data => res.json(data))
    .catch(message => res.json(message));
}
