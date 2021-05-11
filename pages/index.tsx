import Head from 'next/head'
import {useRouter} from 'next/router';
import {Site} from '../components/Site';

export default function Home() {
  let router = useRouter();
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
            <div className="font-bold text-4xl">Mödlinger Dienste schneller.</div>
            <input className="p-2 px-4 rounded-xl outline-none" onKeyDown={(event) => {
              if (event.key === 'Enter') {
                localStorage.setItem('PHPSESSID', (event.target as any).value);
                router.push('/app');
              }
            }}/>
          </div>
        </Site>
      </main>
    </div>
  )
}

