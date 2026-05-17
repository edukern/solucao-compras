import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import styles from './Pendencias.module.css'

const PERGUNTAS = [
  {
    id: 'grade_casal',
    grupo: 'Grades — Tamanhos',
    titulo: 'Grade CASAL',
    pergunta: 'Quais tamanhos existem na grade CASAL? Liste em ordem, separados por vírgula.',
    placeholder: 'Ex: PP, P, M, G, GG',
  },
  {
    id: 'grade_king',
    grupo: 'Grades — Tamanhos',
    titulo: 'Grade KING',
    pergunta: 'Quais tamanhos existem na grade KING?',
    placeholder: 'Ex: Único, P, M, G',
  },
  {
    id: 'grade_queen',
    grupo: 'Grades — Tamanhos',
    titulo: 'Grade QUEEN',
    pergunta: 'Quais tamanhos existem na grade QUEEN?',
    placeholder: 'Ex: Único, P, M',
  },
  {
    id: 'grade_solt',
    grupo: 'Grades — Tamanhos',
    titulo: 'Grade SOLT (Solteiro)',
    pergunta: 'Quais tamanhos existem na grade SOLT?',
    placeholder: 'Ex: Único, P, M, G',
  },
  {
    id: 'grade_lar',
    grupo: 'Grades — Tamanhos',
    titulo: 'Grade LAR',
    pergunta: 'Quais tamanhos existem na grade LAR?',
    placeholder: 'Ex: P, M, G',
  },
  {
    id: 'grade_geral',
    grupo: 'Grades — Tamanhos',
    titulo: 'Grade GERAL',
    pergunta: 'Quais tamanhos existem na grade GERAL?',
    placeholder: 'Ex: PP, P, M, G, GG, XG',
  },
]

export default function Pendencias() {
  const [respostas,  setRespostas]  = useState({}) // { [pergunta_id]: string }
  const [anteriores, setAnteriores] = useState({}) // { [pergunta_id]: { resposta, respondido_em } }
  const [salvando,   setSalvando]   = useState(false)
  const [erro,       setErro]       = useState(null)
  const [sucesso,    setSucesso]    = useState(false)

  useEffect(() => {
    supabase
      .from('pendencias_respostas')
      .select('pergunta_id, resposta, respondido_em')
      .order('respondido_em', { ascending: false })
      .then(({ data }) => {
        if (!data) return
        const map = {}
        for (const row of data) {
          if (!map[row.pergunta_id]) map[row.pergunta_id] = row
        }
        setAnteriores(map)
      })
  }, [])

  async function handleSalvar() {
    const paraEnviar = Object.entries(respostas).filter(([, v]) => v.trim())
    if (!paraEnviar.length) return
    setSalvando(true)
    setErro(null)
    setSucesso(false)

    const rows = paraEnviar.map(([pergunta_id, resposta]) => ({ pergunta_id, resposta: resposta.trim() }))
    const { error } = await supabase.from('pendencias_respostas').insert(rows)

    if (error) {
      setErro('Erro ao salvar. Tente novamente.')
    } else {
      setSucesso(true)
      setRespostas({})
      // Recarrega anteriores
      const { data } = await supabase
        .from('pendencias_respostas')
        .select('pergunta_id, resposta, respondido_em')
        .order('respondido_em', { ascending: false })
      if (data) {
        const map = {}
        for (const row of data) {
          if (!map[row.pergunta_id]) map[row.pergunta_id] = row
        }
        setAnteriores(map)
      }
    }
    setSalvando(false)
  }

  const grupos = [...new Set(PERGUNTAS.map(p => p.grupo))]
  const temResposta = Object.values(respostas).some(v => v.trim())

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Pendências</h1>
        <p className={styles.subtitle}>
          Responda as perguntas abaixo para que o desenvolvedor possa continuar o sistema.
          Você pode responder todas de uma vez ou uma por vez — salve quando quiser.
        </p>
      </div>

      {grupos.map(grupo => (
        <div key={grupo} className={styles.grupo}>
          <div className={styles.grupoTitulo}>{grupo}</div>

          {PERGUNTAS.filter(p => p.grupo === grupo).map(p => {
            const anterior = anteriores[p.id]
            const valor = respostas[p.id] ?? ''

            return (
              <div key={p.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardTitulo}>{p.titulo}</span>
                  {anterior && (
                    <span className={styles.badge}>
                      ✓ Respondida em {new Date(anterior.respondido_em).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>

                <p className={styles.pergunta}>{p.pergunta}</p>

                {anterior && !valor && (
                  <div className={styles.respostaAnterior}>
                    <span className={styles.respostaAnteriorLabel}>Última resposta:</span>
                    <span>{anterior.resposta}</span>
                  </div>
                )}

                <input
                  type="text"
                  className={styles.input}
                  placeholder={valor ? '' : (anterior ? 'Corrigir resposta…' : p.placeholder)}
                  value={valor}
                  onChange={e => setRespostas(prev => ({ ...prev, [p.id]: e.target.value }))}
                />
              </div>
            )
          })}
        </div>
      ))}

      {erro   && <div className={styles.erro}>{erro}</div>}
      {sucesso && <div className={styles.sucesso}>Respostas salvas com sucesso!</div>}

      <div className={styles.actions}>
        <button
          className={styles.btnSalvar}
          disabled={!temResposta || salvando}
          onClick={handleSalvar}
        >
          {salvando ? 'Salvando…' : 'Salvar respostas'}
        </button>
      </div>
    </div>
  )
}
