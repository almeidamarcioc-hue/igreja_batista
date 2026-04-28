'use client'

export default function AbbaStorePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/abba_store.png"
            alt="Abba Store"
            className="w-48 h-48 object-contain"
          />
        </div>

        <h1 className="text-4xl font-bold mb-4" style={{ color: '#1F3A93' }}>
          Abba Store
        </h1>

        <p className="text-xl text-gray-600 mb-2">
          🚧 Página em Construção
        </p>

        <p className="text-gray-500 max-w-md">
          Em breve você poderá acessar a loja da comunidade. Volte mais tarde!
        </p>
      </div>
    </div>
  )
}
