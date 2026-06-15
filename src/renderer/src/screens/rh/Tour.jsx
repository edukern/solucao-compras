import { useState, useEffect } from 'react'

const PAD   = 10   // padding around highlighted element
const TIP_W = 440  // tooltip width px

const STEPS = [
  {
    page:   'vagas',
    sel:    null,
    icon:   '⚡',
    titulo: 'Bolt RH — Seleção simplificada',
    desc:   'Plataforma completa para gerenciar o processo seletivo da Ponto E. Veja como funciona em 5 passos.',
  },
  {
    page:   'vagas',
    sel:    '[data-tour="vagas-nova"]',
    icon:   '📋',
    titulo: 'Criar uma vaga',
    desc:   'Aqui você cria uma nova vaga com título, descrição e localidade. O sistema gera um link exclusivo para compartilhar com os candidatos.',
  },
  {
    page:   'vagas',
    sel:    '[data-tour="vaga-link"]',
    icon:   '🔗',
    titulo: 'Link de candidatura',
    desc:   'Cada vaga tem um link próprio. Cole no WhatsApp da loja ou na bio do Instagram — o candidato preenche pelo celular sem instalar nada.',
  },
  {
    page:   'candidatos',
    sel:    '[data-tour="candidatos-busca"]',
    icon:   '🔍',
    titulo: 'Buscar candidatos',
    desc:   'Encontre qualquer candidato por nome ou CPF, em todas as vagas e etapas do processo de uma vez.',
  },
  {
    page:   'check',
    sel:    null,
    icon:   '✅',
    titulo: 'Background Check',
    desc:   'Consulta simultânea na Boa Vista SCPC e SPC Brasil. Score de crédito e restrições em segundos, salvos automaticamente no perfil do candidato.',
  },
  {
    page:   'roadmap',
    sel:    null,
    icon:   '🚀',
    titulo: 'O que vem por aí',
    desc:   'Funcionalidades em desenvolvimento para as próximas versões do Bolt RH.',
  },
]

export default function Tour({ navigate, onClose }) {
  const [step, setStep] = useState(0)
  const [sp, setSp]     = useState(null)   // spotlight rect { top, left, width, height }

  const current = STEPS[step]
  const isFirst = step === 0
  const isLast  = step === STEPS.length - 1

  useEffect(() => {
    setSp(null)
    navigate(current.page)
    if (!current.sel) return

    const t = setTimeout(() => {
      const el = document.querySelector(current.sel)
      if (!el) return
      const r = el.getBoundingClientRect()
      setSp({ top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 })
    }, 450)

    return () => clearTimeout(t)
  }, [step])

  // --- Tooltip positioning ---
  const VW = window.innerWidth
  const VH = window.innerHeight
  const TIP_H_EST = 210

  let tipStyle, arrowDir = null, arrowOffset = null

  if (sp) {
    const spCenterX  = sp.left + sp.width / 2
    const spBottom   = sp.top  + sp.height
    const belowSpace = VH - spBottom
    const aboveSpace = sp.top

    if (belowSpace >= TIP_H_EST + 24) {
      tipStyle = { top: spBottom + 16, left: Math.max(16, Math.min(spCenterX - TIP_W / 2, VW - TIP_W - 16)) }
      arrowDir = 'up'
    } else if (aboveSpace >= TIP_H_EST + 24) {
      tipStyle = { top: sp.top - TIP_H_EST - 16, left: Math.max(16, Math.min(spCenterX - TIP_W / 2, VW - TIP_W - 16)) }
      arrowDir = 'down'
    } else {
      tipStyle = { top: Math.max(16, sp.top), left: Math.min(sp.left + sp.width + 16, VW - TIP_W - 16) }
    }

    if (arrowDir && tipStyle.left !== undefined) {
      arrowOffset = Math.max(16, Math.min(spCenterX - tipStyle.left - 8, TIP_W - 32))
    }
  } else {
    tipStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  }

  return (
    <>
      {/* Click interceptor + fallback backdrop for no-spotlight steps */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: sp ? 'transparent' : 'rgba(0,0,0,0.62)',
        }}
        onClick={onClose}
      />

      {/* Spotlight: box-shadow creates dark overlay with a "hole" around the element */}
      {sp && (
        <div style={{
          position: 'fixed',
          top: sp.top, left: sp.left,
          width: sp.width, height: sp.height,
          borderRadius: 10,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.62)',
          border: '2px solid rgba(255,255,255,0.8)',
          zIndex: 1001,
          pointerEvents: 'none',
        }} />
      )}

      {/* Tooltip card */}
      <div
        onClick={e => e.stopPropagation()}
        style={{ position: 'fixed', zIndex: 1002, width: TIP_W, ...tipStyle }}
      >
        {arrowDir === 'up' && (
          <div style={{
            position: 'absolute', top: -9, left: arrowOffset,
            width: 0, height: 0,
            borderLeft: '9px solid transparent',
            borderRight: '9px solid transparent',
            borderBottom: '9px solid #fff',
            filter: 'drop-shadow(0 -2px 2px rgba(0,0,0,0.12))',
          }} />
        )}

        <div style={card}>
          {arrowDir === 'down' && (
            <div style={{
              position: 'absolute', bottom: -9, left: arrowOffset,
              width: 0, height: 0,
              borderLeft: '9px solid transparent',
              borderRight: '9px solid transparent',
              borderTop: '9px solid #fff',
              filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.12))',
            }} />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <span style={{ fontSize: 26, lineHeight: 1 }}>{current.icon}</span>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111', lineHeight: 1.2 }}>{current.titulo}</div>
          </div>

          <div style={{ fontSize: 14, color: '#555', lineHeight: 1.65, marginBottom: 20 }}>
            {current.desc}
          </div>

          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 18 }}>
            {STEPS.map((_, i) => (
              <div
                key={i}
                onClick={() => setStep(i)}
                style={{
                  width: i === step ? 20 : 8, height: 8, borderRadius: 4,
                  background: i === step ? '#111' : '#e5e7eb',
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={onClose} style={bt.close}>{isLast ? 'Fechar' : 'Pular'}</button>
            <div style={{ display: 'flex', gap: 8 }}>
              {!isFirst && (
                <button onClick={() => setStep(p => p - 1)} style={bt.nav}>← Voltar</button>
              )}
              {isLast
                ? <button onClick={onClose} style={bt.primary}>Concluir ✓</button>
                : <button onClick={() => setStep(p => p + 1)} style={bt.primary}>Próximo →</button>
              }
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const card = {
  background: '#fff',
  borderRadius: 14,
  padding: '22px 26px 20px',
  boxShadow: '0 8px 40px rgba(0,0,0,0.22)',
  position: 'relative',
}

const bt = {
  close:   { background: 'none', border: 'none', fontSize: 13, color: '#bbb', cursor: 'pointer', padding: 0 },
  nav:     { padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#444' },
  primary: { padding: '8px 18px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
}
