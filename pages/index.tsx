import Head from 'next/head'
import {useRouter} from 'next/router';
import {Responsive} from '../components/Responsive';

export default function Home() {
  let router = useRouter();
  return (
    <div>
      <Head>
        <title>Rotes Kreuz Dienste Mödling</title>
        <meta name="description" content="Finde die passenden Dienste für dich"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>
      <main>
        <Responsive>
          <div className="text-3xl">
            <div className="text-primary font-bold">Tragen Sie hier Ihre Intranet-Mödling PHPSESSID ein</div>
            <input className="bg-gray-200 p-2 px-4 rounded-xl outline-none" onKeyDown={(event) => {
              if (event.key === 'Enter') {
                localStorage.setItem('PHPSESSID', (event.target as any).value);
                router.push('/app');
              }
            }}/>
          </div>
        </Responsive>
      </main>
    </div>
  )
}

