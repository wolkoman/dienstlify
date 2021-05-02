import {Responsive} from '../components/Responsive';
import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';


export default function App() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [duties, setDuties] = useState([]);
  const [filter, setFilter] = useState({
    dienststellen: {},
    type: {Tag: true, Nacht: true},
    positions: {driver: 0, san1: 0, san2: 0},
    search: ''
  });
  useEffect(() => {
    let sessionId = window.localStorage.getItem('PHPSESSID');
    if (!sessionId) {
      router.push('/');
      return;
    }
    fetch(`/api/duties?token=${sessionId}`).then(response => response.json())
      .then(duties => {
        setLoading(false);
        setDuties(duties);
        let dienststellen = Array.from(new Set(duties.map(duty => duty.title)));
        setFilter(f => ({...f, dienststellen: Object.fromEntries(dienststellen.map(d => [d, true]))}));
      });
  }, []);
  return <Responsive>
    {loading ? <>lädt</> : <>
      <div className="mb-2">
        <div className="inline-flex rounded overflow-hidden select-none mr-2 mb-2">
          {Object.entries(filter.dienststellen).map(([dienstelle, active]) =>
            <div key={dienstelle} onClick={() => setFilter(f => ({
              ...f,
              dienststellen: Object.fromEntries(Object.entries(filter.dienststellen).map(([name, active]) => [name, name === dienstelle ? !active : active]))
            }))}
                 className={`px-3 py-1 cursor-pointer ${active ? 'bg-secondary text-white' : 'bg-gray-200'}`}>
              {dienstelle}
            </div>
          )}
        </div>
        <div className="inline-flex rounded overflow-hidden select-none mr-2 mb-2">
          {Object.entries(filter.positions).map(([position, active]) =>
            <div key={position} onClick={() => setFilter(f => ({
              ...f,
              positions: Object.fromEntries(Object.entries(filter.positions).map(([name, active]) => [name, name === position ? (active + 1) % 3 : active])) as any
            }))}
                 className={`px-3 py-1 cursor-pointer ${['bg-secondary text-white', 'bg-gray-200', 'bg-gray-800 text-white'][active]}`}>
              {{driver: 'Fahrer', san1: 'San1', san2: 'San2'}[position]}
            </div>
          )}
        </div>
        <div className="inline-flex rounded overflow-hidden select-none mr-2 mb-2">
          {Object.entries(filter.type).map(([type, active]) =>
            <div key={type} onClick={() => setFilter(f => ({
              ...f,
              type: Object.fromEntries(Object.entries(filter.type).map(([name, active]) => [name, name === type ? !active : active])) as any
            }))}
                 className={`px-3 py-1 cursor-pointer ${active ? 'bg-secondary text-white' : 'bg-gray-200'}`}>
              {type}
            </div>
          )}
        </div>
        <input placeholder="Suchen.." className="bg-gray-200 px-3 py-1 rounded outline-none  mb-2" onInput={element => setFilter(f => ({
          ...f,
          search: (element.target as any).value
        }))} value={filter.search}/>
      </div>
      <div className="grid grid-cols-table">
        {duties
          .filter(duty =>
            Object.entries(filter.dienststellen)
              .filter(([_, active]) => active).map(([name]) => name)
              .includes(duty.title)
          )
          .filter(duty =>
            Object.entries(filter.type)
              .filter(([_, active]) => active).flatMap(([name]) => name === 'Tag' ? ['07:00', '13:00'] : ['19:00'])
              .includes(duty.startTime)
          )
          .filter(duty =>
            Object.entries(filter.positions)
              .filter(([_, active]) => active > 0).every(([name, active]) => (duty[name] === null || active === 2) && (duty[name] !== null || active === 1))
          )
          .filter(duty => {
              const regex = new RegExp(filter.search, 'i');
              return !!`${duty.driver} ${duty.san1} ${duty.san2}`.match(regex);
            }
          )
          .flatMap(duty => [
            <div className="truncate">{duty.title}</div>,
            <div className="">{pad(duty.day)}.{pad(duty.month)}</div>,
            <div className="truncate">{duty.startTime}</div>,
            <div className="truncate">{duty.driver}</div>,
            <div className="truncate">{duty.san1}</div>,
            <div className="truncate">{duty.san2}</div>
          ])}
      </div>
    </>}
  </Responsive>;
}

function pad(value: any, length = 2, filler = '0') {
  return `${Array(length - value.toString().length).fill(filler).join('')}${value}`;
}