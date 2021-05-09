import {NextApiRequest, NextApiResponse} from 'next';
import iconv from 'iconv-lite';
import cheerio from 'cheerio';

export default async (req: NextApiRequest, res: NextApiResponse) => {

  if(req.query.stationId == undefined || req.query.month == undefined || req.query.year  == undefined){
    res.status(400);
    return;
  }

  const toName = (value: string) => ['Gesperrt!', 'Rücksprache mit Mannschaft', '', ' Eintragen'].includes(value) ? null : value;

  const fetchPage = ({stationId, month, year}: { stationId: number, month: number, year: number }) =>
    fetch(
      `https://intranet-md.n.roteskreuz.at/intern/?itemid=87&id=${stationId}&month=${month}&year=${year}`,
      {headers: {Cookie: `PHPSESSID=${req.query.token};`}}
    )
      .then(response => response.arrayBuffer())
      .then(buffer => iconv.decode(new Buffer(buffer), 'iso-8859-1'))
      .then(html => cheerio.load(html))
      .then(document => {
        const title = document('legend').text().replace('RTW-C ', '');
        return Array.from(document('.table-responsive tbody').children())
            .map(x => x.childNodes)
            .map(x => ({
              day: +(document(x[0]).text().split('.')[0]),
              month, year, title,
              startTime: cheerio(x[2]).text().split(' - ')[0],
              driver: toName(cheerio(x[4]).text()),
              san1: toName(cheerio(x[5]).text()),
              san2: toName(cheerio(x[6]).text()),
            }))
        });

  await fetchPage({stationId: +req.query.stationId, month: +req.query.month, year: +req.query.year })
    .then(data => res.json(data))
    .catch(message => res.json(message));
}
