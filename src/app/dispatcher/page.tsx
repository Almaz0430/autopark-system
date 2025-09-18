import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./Map'), { ssr: false });

export default function DispatcherPage() {
  return (
    <div>
      <h1>Dispatcher Dashboard</h1>
      <Map />
    </div>
  );
}
