import Head from 'next/head'
import {useRouter} from 'next/router';
import {Site} from '../components/Site';

export default function Home() {
  let router = useRouter();

  function confirm(event: any) {
    localStorage.setItem('PHPSESSID', (event.target as any).value);
    router.push('/app');
  }

  return (
    <div>
      <Head>
        <title>dienstlify</title>
        <meta name="description" content="Finde die passenden Dienste für dich"/>
        <link rel="icon" type="image/png" href="/favicon.png"/>
      </Head>
      <main>
        <Site>
          <div className="mt-16">
            <div className="font-bold text-4xl">Mödlinger Dienste</div>
            <div className="py-3">
              Geben Sie hier das Cookie PHPSESSID<br/> von der Seite <a href="https://intranet-md.n.roteskreuz.at/">intranet-md.n.roteskreuz.at</a> ein:
            </div>
            <div className="inline-flex rounded-xl overflow-hidden">
              <input className="p-2 px-4 outline-none" onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  confirm(event);
                }
              }}/>
              <div className="bg-secondary p-2 text-white cursor-pointer" onClick={confirm}>Weiter</div>
            </div>
          </div>
        </Site>
      </main>
    </div>
  )
}

