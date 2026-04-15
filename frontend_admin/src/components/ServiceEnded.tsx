export function ServiceEnded() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ backgroundColor: '#F9FAFB', color: '#111827' }}
    >
      <main
        role="main"
        className="w-full max-w-[560px] bg-white rounded-xl shadow-sm text-center"
        style={{ padding: '48px 32px' }}
      >
        <h1
          className="font-bold tracking-wide"
          style={{ fontSize: '32px', color: '#1E40AF', marginBottom: '24px' }}
        >
          PsyFit
        </h1>
        <div
          aria-hidden="true"
          style={{
            width: '48px',
            height: '3px',
            backgroundColor: '#1E40AF',
            borderRadius: '2px',
            margin: '0 auto 32px',
          }}
        />
        <p
          className="leading-relaxed"
          style={{ fontSize: '16px', color: '#374151', marginBottom: '12px' }}
        >
          本サービスの提供は終了いたしました。
        </p>
        <p
          className="leading-relaxed font-medium"
          style={{ fontSize: '16px', color: '#111827', marginTop: '24px' }}
        >
          お使いいただきありがとうございました。
        </p>
      </main>
    </div>
  )
}
