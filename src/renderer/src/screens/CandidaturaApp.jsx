import { useState, useEffect } from 'react'

const STEPS = ['Contato', 'Perfil', 'Formação', 'Motivação']

const INIT = {
  nome: '', cpf: '', email: '', telefone: '', cidade: '',
  data_nascimento: '', estado_civil: '', filhos: '', filhos_qtd: '',
  facebook: '', instagram: '', endereco: '', deslocamento: '',
  escolaridade: '', estudando: '', curso_prof: '', curso_prof_qual: '',
  experiencia: '', experiencia_desc: '', conhece_empresa: '', motivacao: '',
  curriculo: null, aceite_lgpd: false,
}

export default function CandidaturaApp() {
  const vagaId = window.location.pathname.split('/')[2]

  const [vaga, setVaga]           = useState(null)
  const [loadingVaga, setLoading] = useState(true)
  const [vagaError, setVagaError] = useState('')
  const [step, setStep]           = useState(1)
  const [form, setForm]           = useState(INIT)
  const [erro, setErro]           = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [piLink, setPiLink]       = useState(null)
  const [success, setSuccess]     = useState(false)

  useEffect(() => {
    if (!vagaId) { setVagaError('Link inválido.'); setLoading(false); return }
    fetch(`/api/vaga-publica?id=${vagaId}`)
      .then(r => r.json())
      .then(d => { if (d.error) setVagaError(d.error); else setVaga(d) })
      .catch(() => setVagaError('Erro ao carregar vaga. Tente novamente.'))
      .finally(() => setLoading(false))
  }, [vagaId])

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  function fmtCPF(v) {
    const d = v.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 3) return d
    if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`
    if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`
    return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
  }

  function fmtPhone(v) {
    const d = v.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 2) return d
    if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`
    if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
  }

  function validate() {
    if (step === 1) {
      if (!form.nome.trim())  return 'Nome completo obrigatório.'
      if (!form.email.trim()) return 'Email obrigatório.'
      if (!form.telefone.trim()) return 'Telefone obrigatório.'
      const cpf = form.cpf.replace(/\D/g, '')
      if (cpf && cpf.length !== 11) return 'CPF deve ter 11 dígitos.'
    }
    if (step === 2) {
      if (!form.data_nascimento) return 'Data de nascimento obrigatória.'
      if (!form.estado_civil)    return 'Estado civil obrigatório.'
      if (!form.deslocamento)    return 'Como você se deslocaria ao trabalho?'
    }
    if (step === 3) {
      if (!form.escolaridade) return 'Escolaridade obrigatória.'
    }
    if (step === 4) {
      if (!form.motivacao.trim()) return 'Conte por que quer trabalhar aqui.'
      if (!form.aceite_lgpd)      return 'Aceite os termos para enviar.'
    }
    return null
  }

  function next() {
    const e = validate(); if (e) { setErro(e); return }
    setErro(''); setStep(s => s + 1)
  }

  function back() { setErro(''); setStep(s => s - 1) }

  async function submit() {
    const e = validate(); if (e) { setErro(e); return }
    setSubmitting(true); setErro('')

    let curriculo_base64 = null, curriculo_nome = null, curriculo_mime = null
    if (form.curriculo) {
      try {
        curriculo_base64 = await toBase64(form.curriculo)
        curriculo_nome   = form.curriculo.name
        curriculo_mime   = form.curriculo.type
      } catch { /* currículo opcional — segue sem ele */ }
    }

    try {
      const res = await fetch('/api/candidatura-publica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vaga_id:          vagaId,
          nome:             form.nome.trim(),
          cpf:              form.cpf.replace(/\D/g, '') || null,
          email:            form.email.trim().toLowerCase(),
          telefone:         form.telefone,
          cidade:           form.cidade.trim() || null,
          data_nascimento:  form.data_nascimento,
          estado_civil:     form.estado_civil,
          filhos:           form.filhos === 'sim',
          filhos_qtd:       form.filhos === 'sim' ? form.filhos_qtd : null,
          facebook:         form.facebook.trim() || null,
          instagram:        form.instagram.trim() || null,
          endereco:         form.endereco.trim() || null,
          deslocamento:     form.deslocamento,
          escolaridade:     form.escolaridade,
          estudando:        form.estudando === 'sim',
          curso_prof:       form.curso_prof === 'sim',
          curso_prof_qual:  form.curso_prof === 'sim' ? form.curso_prof_qual : null,
          experiencia:      form.experiencia === 'sim',
          experiencia_desc: form.experiencia === 'sim' ? form.experiencia_desc : null,
          conhece_empresa:  form.conhece_empresa.trim() || null,
          motivacao:        form.motivacao.trim(),
          aceite_lgpd:      true,
          curriculo_base64, curriculo_nome, curriculo_mime,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error || `Erro ${res.status}`); setSubmitting(false); return }
      setPiLink(data.pi_link)
      setSuccess(true)
    } catch {
      setErro('Falha de conexão. Verifique sua internet e tente novamente.')
      setSubmitting(false)
    }
  }

  if (loadingVaga) return <Shell><p style={s.muted}>Carregando…</p></Shell>
  if (vagaError)   return <Shell><p style={{ color: '#dc2626', fontSize: 15 }}>{vagaError}</p></Shell>
  if (success)     return <Success vaga={vaga} piLink={piLink} />

  return (
    <Shell>
      <div style={s.header}>
        <div style={s.brand}>Ponto E Vagas</div>
        <div style={s.vagaTitulo}>{vaga.titulo}</div>
        {vaga.empresa_nome && <div style={s.empresa}>{vaga.empresa_nome}</div>}
      </div>

      <div style={s.progressRow}>
        {STEPS.map((label, i) => (
          <div key={i} style={s.progressItem}>
            <div style={{
              ...s.dot,
              background: i + 1 < step ? '#16a34a' : i + 1 === step ? '#111' : '#e5e7eb',
              color:      i + 1 <= step ? '#fff' : '#aaa',
            }}>
              {i + 1 < step ? '✓' : i + 1}
            </div>
            <span style={{ ...s.stepLabel, color: i + 1 === step ? '#111' : '#aaa', fontWeight: i + 1 === step ? 600 : 400 }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <div style={s.formBody}>
        {step === 1 && <Step1 form={form} set={set} fmtCPF={fmtCPF} fmtPhone={fmtPhone} />}
        {step === 2 && <Step2 form={form} set={set} />}
        {step === 3 && <Step3 form={form} set={set} />}
        {step === 4 && <Step4 form={form} set={set} />}

        {erro && <p style={s.error}>{erro}</p>}

        <div style={s.actions}>
          {step > 1 && <button onClick={back} style={s.btnSec}>← Voltar</button>}
          {step < 4
            ? <button onClick={next} style={s.btnPri}>Continuar →</button>
            : <button onClick={submit} disabled={submitting} style={{ ...s.btnPri, opacity: submitting ? 0.6 : 1 }}>
                {submitting ? 'Enviando…' : 'Enviar candidatura'}
              </button>
          }
        </div>
      </div>

      <p style={s.lgpd}>
        Seus dados são protegidos e mantidos com segurança. Você pode solicitar a exclusão a qualquer momento.
      </p>
    </Shell>
  )
}

// ── Steps ────────────────────────────────────────────────────────────

function Step1({ form, set, fmtCPF, fmtPhone }) {
  return (
    <div style={s.fields}>
      <Field label="Nome completo *">
        <input style={s.input} value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Seu nome completo" />
      </Field>
      <Field label="CPF">
        <input style={s.input} value={form.cpf} onChange={e => set('cpf', fmtCPF(e.target.value))} placeholder="000.000.000-00" inputMode="numeric" />
      </Field>
      <Field label="Email *">
        <input style={s.input} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="seu@email.com" />
      </Field>
      <Field label="Telefone / WhatsApp *">
        <input style={s.input} value={form.telefone} onChange={e => set('telefone', fmtPhone(e.target.value))} placeholder="(00) 00000-0000" inputMode="tel" />
      </Field>
      <Field label="Cidade onde mora">
        <input style={s.input} value={form.cidade} onChange={e => set('cidade', e.target.value)} placeholder="Ex: Três Coroas" />
      </Field>
    </div>
  )
}

function Step2({ form, set }) {
  return (
    <div style={s.fields}>
      <Field label="Data de nascimento *">
        <input style={s.input} type="date" value={form.data_nascimento} onChange={e => set('data_nascimento', e.target.value)} />
      </Field>
      <Field label="Estado civil *">
        <Select value={form.estado_civil} onChange={v => set('estado_civil', v)}
          options={['', 'Solteiro(a)', 'Casado(a)', 'Juntado(a)', 'Divorciado(a)', 'Viúvo(a)']}
          placeholder="Selecione" />
      </Field>
      <Field label="Possui filhos?">
        <RadioGroup value={form.filhos} onChange={v => set('filhos', v)} options={['sim', 'não']} />
      </Field>
      {form.filhos === 'sim' && (
        <Field label="Quantos filhos?">
          <input style={{ ...s.input, width: 80 }} type="number" min={1} max={20} value={form.filhos_qtd} onChange={e => set('filhos_qtd', e.target.value)} />
        </Field>
      )}
      <Field label="Facebook (opcional)">
        <input style={s.input} value={form.facebook} onChange={e => set('facebook', e.target.value)} placeholder="Nome ou link do perfil" />
      </Field>
      <Field label="Instagram (opcional)">
        <input style={s.input} value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="@usuario" />
      </Field>
      <Field label="Endereço residencial (opcional)">
        <input style={s.input} value={form.endereco} onChange={e => set('endereco', e.target.value)} placeholder="Rua, número, bairro" />
      </Field>
      <Field label="Como se deslocaria ao trabalho? *">
        <Select value={form.deslocamento} onChange={v => set('deslocamento', v)}
          options={['', 'A pé', 'Bicicleta', 'Moto própria', 'Carro próprio', 'Transporte público', 'Carona']}
          placeholder="Selecione" />
      </Field>
    </div>
  )
}

function Step3({ form, set }) {
  return (
    <div style={s.fields}>
      <Field label="Escolaridade *">
        <Select value={form.escolaridade} onChange={v => set('escolaridade', v)}
          options={['', 'Ensino Fundamental', 'Ensino Médio', 'Ensino Superior', 'Pós-graduação']}
          placeholder="Selecione" />
      </Field>
      <Field label="Está estudando atualmente?">
        <RadioGroup value={form.estudando} onChange={v => set('estudando', v)} options={['sim', 'não']} />
      </Field>
      <Field label="Possui curso profissionalizante?">
        <RadioGroup value={form.curso_prof} onChange={v => set('curso_prof', v)} options={['sim', 'não']} />
      </Field>
      {form.curso_prof === 'sim' && (
        <Field label="Qual curso?">
          <input style={s.input} value={form.curso_prof_qual} onChange={e => set('curso_prof_qual', e.target.value)} placeholder="Nome do curso" />
        </Field>
      )}
      <Field label="Já trabalhou antes?">
        <RadioGroup value={form.experiencia} onChange={v => set('experiencia', v)} options={['sim', 'não']} />
      </Field>
      {form.experiencia === 'sim' && (
        <Field label="Descreva onde trabalhou, suas funções e por quanto tempo">
          <textarea style={{ ...s.input, minHeight: 90, resize: 'vertical' }}
            value={form.experiencia_desc}
            onChange={e => set('experiencia_desc', e.target.value)}
            placeholder="Ex: Trabalhei no Mercado X como caixa por 2 anos..." />
        </Field>
      )}
    </div>
  )
}

function Step4({ form, set }) {
  return (
    <div style={s.fields}>
      <Field label="Você conhece nossa empresa? O que sabe sobre nós? (opcional)">
        <textarea style={{ ...s.input, minHeight: 80, resize: 'vertical' }}
          value={form.conhece_empresa}
          onChange={e => set('conhece_empresa', e.target.value)}
          placeholder="Conte o que sabe sobre a empresa…" />
      </Field>
      <Field label="O que te motivou a querer trabalhar aqui? *">
        <textarea style={{ ...s.input, minHeight: 100, resize: 'vertical' }}
          value={form.motivacao}
          onChange={e => set('motivacao', e.target.value)}
          placeholder="Seja à vontade para contar…" />
      </Field>
      <Field label="Currículo (opcional — PDF, Word ou imagem, máx. 4MB)">
        <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={e => set('curriculo', e.target.files[0] || null)}
          style={{ fontSize: 13, color: '#444' }} />
        {form.curriculo && <span style={{ fontSize: 12, color: '#16a34a' }}>✓ {form.curriculo.name}</span>}
      </Field>
      <label style={s.checkRow}>
        <input type="checkbox" checked={form.aceite_lgpd} onChange={e => set('aceite_lgpd', e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
        <span style={{ fontSize: 13, color: '#444', lineHeight: 1.5 }}>
          Autorizo o armazenamento dos meus dados para fins do processo seletivo, conforme a LGPD. Posso solicitar exclusão a qualquer momento.
        </span>
      </label>
    </div>
  )
}

// ── Tela de sucesso ───────────────────────────────────────────────────

function Success({ vaga, piLink }) {
  return (
    <Shell>
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: '#111' }}>Candidatura enviada!</h2>
        <p style={{ margin: '0 0 24px', fontSize: 15, color: '#666', lineHeight: 1.6 }}>
          Recebemos sua candidatura para <strong>{vaga?.titulo}</strong>.<br />
          Entraremos em contato em breve.
        </p>
        {piLink && (
          <div style={{ background: '#f8fafc', borderRadius: 12, padding: 20, border: '1px solid #e5e7eb', marginBottom: 8 }}>
            <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: '#111' }}>
              Uma etapa importante: teste comportamental
            </p>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#666' }}>
              Pedimos que você complete o teste — leva cerca de 10 minutos.
            </p>
            <a href={piLink} target="_blank" rel="noreferrer" style={s.btnPri}>
              Fazer o teste agora →
            </a>
          </div>
        )}
      </div>
    </Shell>
  )
}

// ── Componentes auxiliares ────────────────────────────────────────────

function Shell({ children }) {
  return (
    <div style={s.outer}>
      <div style={s.card}>{children}</div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label style={s.fieldWrap}>
      <span style={s.label}>{label}</span>
      {children}
    </label>
  )
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select style={s.input} value={value} onChange={e => onChange(e.target.value)}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.filter(o => o !== '').map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function RadioGroup({ value, onChange, options }) {
  return (
    <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
      {options.map(o => (
        <label key={o} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer', textTransform: 'capitalize' }}>
          <input type="radio" name={o} checked={value === o} onChange={() => onChange(o)}
            style={{ width: 16, height: 16, cursor: 'pointer' }} />
          {o}
        </label>
      ))}
    </div>
  )
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload  = e => resolve(e.target.result.split(',')[1])
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

// ── Estilos ───────────────────────────────────────────────────────────

const s = {
  outer:        { minHeight: '100vh', background: '#f5f5f5', display: 'flex', justifyContent: 'center', padding: '24px 16px', boxSizing: 'border-box' },
  card:         { background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, padding: '28px 24px', boxShadow: '0 4px 24px rgba(0,0,0,.08)', alignSelf: 'flex-start' },
  header:       { marginBottom: 24 },
  brand:        { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: 8 },
  vagaTitulo:   { fontSize: 22, fontWeight: 700, color: '#111', lineHeight: 1.3 },
  empresa:      { fontSize: 13, color: '#666', marginTop: 4 },
  progressRow:  { display: 'flex', gap: 4, marginBottom: 28, overflowX: 'auto' },
  progressItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1, minWidth: 60 },
  dot:          { width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, transition: 'background 0.2s' },
  stepLabel:    { fontSize: 10, textAlign: 'center', letterSpacing: '0.03em' },
  formBody:     { display: 'flex', flexDirection: 'column', gap: 0 },
  fields:       { display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 },
  fieldWrap:    { display: 'flex', flexDirection: 'column', gap: 6 },
  label:        { fontSize: 13, fontWeight: 600, color: '#444' },
  input:        { padding: '11px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.15s' },
  checkRow:     { display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginTop: 4 },
  error:        { margin: '8px 0 0', color: '#dc2626', fontSize: 13 },
  actions:      { display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' },
  btnPri:       { padding: '12px 24px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' },
  btnSec:       { padding: '12px 20px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', color: '#444', fontSize: 14, cursor: 'pointer' },
  lgpd:         { margin: '20px 0 0', fontSize: 11, color: '#aaa', textAlign: 'center', lineHeight: 1.5 },
  muted:        { color: '#888', fontSize: 14 },
}
