export function Responsive({children}) {
  return <div className="mx-auto max-w-2xl">
    <div className="h-1 bg-secondary"/>
    <div className="my-4">
      <div className="text-2xl text-secondary mb-4 font-bold">dienstlify</div>
      {children}
    </div>
  </div>;
}