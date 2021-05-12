export function Site({children}) {
  return <div className="mx-auto max-w-2xl px-4">
      <div className="flex items-center pt-6 pb-6 sticky top-0 bg-primary">
        <img src="logo.svg" className="w-6 mr-3"/>
        <div className="text-2xl text-secondary font-bold">dienstlify</div>
      </div>
      {children}
  </div>;
}