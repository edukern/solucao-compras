import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import styles from './Pendencias.module.css'

// ─── Dados estáticos de status ──────────────────────────────────────────────

const STATUS_PRONTO = [
  'Fluxo completo de compra: sessão → pedidos por loja → PDF',
  'Dashboard com projeção vs comprado por segmentação',
  'Histórico de sessões com edição e exclusão',
  'Campos Transportadora e Nota Fiscal no pedido',
  'Recuperação automática se o app fechar no meio de uma sessão',
  'Atualização automática do app quando houver nova versão',
  'Suite de testes automatizados (90 testes passando)',
]

const STATUS_AGUARDANDO = [
  'Tamanhos das grades CASAL, KING, QUEEN, SOLT, LAR, GERAL — Samuel responde abaixo',
  'Planilha da Miche com análise de vendas [qtde compra, venda, estoque total, com segmentação por coleção e tipo/classe/classificação]',
]

const STATUS_AFAZER_SAMUEL = [
  '(opcional) Solicitar para a Macle modelo de importação de cadastro de produto via CSV',
]

const STATUS_AFAZER = [
  'Cadastrar os tamanhos no código depois que Samuel responder as grades',
  'Tela de importação da planilha da Miche (para calcular projeções com dados reais)',
  'Verificar e finalizar tela de gestão de fornecedores (criar/editar)',
  'ERP import — quando solicitar o formato para a fornecedora do sistema',
]

// ─── Perguntas para Samuel ────────────────────────────────────────────────────

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
  {
    id: 'nf_transportadora',
    grupo: 'Pedidos de Compra',
    titulo: 'Nota Fiscal e Transportadora',
    pergunta: 'Você costuma preencher Nota Fiscal e Transportadora nos pedidos de compra? Se sim, normalmente sabe essas informações na hora da visita ao fornecedor ou só depois?',
    placeholder: 'Ex: Sim, a NF chega depois. A transportadora sei na hora.',
  },
  {
    id: 'planilha_historica',
    grupo: 'Dados Históricos',
    titulo: 'Planilha de vendas da Miche',
    pergunta: 'O sistema precisa da planilha semestral que a Miche faz com os dados de vendas por tamanho (para calcular as projeções de compra). Quando puder, manda para o Edu. Responda aqui quando tiver enviado.',
    placeholder: 'Ex: Enviei hoje por WhatsApp / e-mail',
  },
]

// ─── Componente ───────────────────────────────────────────────────────────────

export default function Pendencias() {
  const [respostas,  setRespostas]  = useState({})
  const [anteriores, setAnteriores] = useState({})
  const [salvando,   setSalvando]   = useState(false)
  const [erro,       setErro]       = useState(null)
  const [sucesso,    setSucesso]    = useState(false)
  const [abaAtiva,   setAbaAtiva]   = useState('status') // 'status' | 'sistema' | 'perguntas'

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
  const perguntasRespondidas = PERGUNTAS.filter(p => anteriores[p.id]).length

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Solução Compras — Painel do Projeto</h1>
        <p className={styles.subtitle}>
          Acompanhamento do desenvolvimento, informações sobre o sistema e perguntas em aberto.
        </p>
      </div>

      {/* Abas */}
      <div className={styles.abas}>
        <button
          className={`${styles.aba} ${abaAtiva === 'status' ? styles.abaAtiva : ''}`}
          onClick={() => setAbaAtiva('status')}
        >
          Status do Projeto
        </button>
        <button
          className={`${styles.aba} ${abaAtiva === 'sistema' ? styles.abaAtiva : ''}`}
          onClick={() => setAbaAtiva('sistema')}
        >
          Sobre o Sistema
        </button>
        <button
          className={`${styles.aba} ${abaAtiva === 'perguntas' ? styles.abaAtiva : ''}`}
          onClick={() => setAbaAtiva('perguntas')}
        >
          Perguntas
          {perguntasRespondidas < PERGUNTAS.length && (
            <span className={styles.abaBadge}>{PERGUNTAS.length - perguntasRespondidas}</span>
          )}
        </button>
      </div>

      {/* ── Aba: Status ── */}
      {abaAtiva === 'status' && (
        <div className={styles.abaConteudo}>
          <div className={styles.statusBloco}>
            <div className={styles.statusTitulo}>Pronto</div>
            {STATUS_PRONTO.map((item, i) => (
              <div key={i} className={styles.statusItem}>
                <span className={styles.statusIconOk}>✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className={styles.statusBloco}>
            <div className={styles.statusTitulo}>Aguardando Samuel</div>
            {STATUS_AGUARDANDO.map((item, i) => (
              <div key={i} className={styles.statusItem}>
                <span className={styles.statusIconWait}>○</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className={styles.statusBloco}>
            <div className={styles.statusTitulo}>A fazer — Samuel</div>
            {STATUS_AFAZER_SAMUEL.map((item, i) => (
              <div key={i} className={styles.statusItem}>
                <span className={styles.statusIconTodo}>·</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className={styles.statusBloco}>
            <div className={styles.statusTitulo}>A fazer — Edu</div>
            {STATUS_AFAZER.map((item, i) => (
              <div key={i} className={styles.statusItem}>
                <span className={styles.statusIconTodo}>·</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Aba: Sobre o Sistema ── */}
      {abaAtiva === 'sistema' && (
        <div className={styles.abaConteudo}>
          <div className={styles.infoBloco}>
            <div className={styles.infoBlocoTitulo}>O que é o programa</div>
            <p className={styles.infoTexto}>
              O Solução Compras é um programa feito sob medida para organizar as compras das coleções.
              Ele roda no computador do Samuel — não precisa de internet para funcionar no dia a dia.
              Todos os dados (pedidos, coleções, fornecedores) ficam salvos no computador, em um arquivo
              seguro chamado <strong>compras.db</strong>.
            </p>
            <p className={styles.infoTexto}>
              A única parte que usa internet é esta tela — que serve de comunicação entre Samuel e Edu
              durante o desenvolvimento.
            </p>
          </div>

          <div className={styles.infoBloco}>
            <div className={styles.infoBlocoTitulo}>Custos</div>
            <div className={styles.tabelaCustos}>
              <div className={styles.linhaCusto}>
                <span>Hospedagem desta tela (Vercel)</span>
                <span className={styles.custoValor}>Grátis</span>
              </div>
              <div className={styles.linhaCusto}>
                <span>Banco de dados desta tela (Supabase)</span>
                <span className={styles.custoValor}>Grátis</span>
              </div>
              <div className={styles.linhaCusto}>
                <span>Repositório do código (GitHub)</span>
                <span className={styles.custoValor}>Grátis</span>
              </div>
              <div className={styles.linhaCusto}>
                <span>Programa desktop (roda local)</span>
                <span className={styles.custoValor}>Grátis — sem assinatura</span>
              </div>
              <div className={`${styles.linhaCusto} ${styles.linhaCustoDestaque}`}>
                <span>Manutenção e desenvolvimento</span>
                <span className={styles.custoValor}>Combinado com Edu</span>
              </div>
            </div>
          </div>

          <div className={styles.infoBloco}>
            <div className={styles.infoBlocoTitulo}>Se der problema</div>
            <div className={styles.passos}>
              <div className={styles.passo}>
                <span className={styles.passoNum}>1</span>
                <div>
                  <strong>Fala com o Edu.</strong> Manda mensagem descrevendo o que aconteceu —
                  o que você estava fazendo, o que apareceu na tela.
                </div>
              </div>
              <div className={styles.passo}>
                <span className={styles.passoNum}>2</span>
                <div>
                  <strong>Edu acessa o código</strong> e corrige. Se for um bug, lança uma nova versão.
                </div>
              </div>
              <div className={styles.passo}>
                <span className={styles.passoNum}>3</span>
                <div>
                  <strong>O programa atualiza sozinho.</strong> Na próxima vez que você abrir o app,
                  ele baixa a correção automaticamente.
                </div>
              </div>
              <div className={styles.passo}>
                <span className={styles.passoNum}>4</span>
                <div>
                  <strong>Os dados nunca são apagados</strong> numa atualização. A atualização só
                  troca o programa, não o arquivo de dados.
                </div>
              </div>
            </div>
          </div>

          <div className={styles.infoBloco}>
            <div className={styles.infoBlocoTitulo}>O que cada peça faz (simplificado)</div>
            <div className={styles.stackGrid}>
              <div className={styles.stackItem}>
                <span className={styles.stackNome}>Programa desktop</span>
                <span className={styles.stackDesc}>Feito com Electron — mesma tecnologia do VS Code e Discord. Instala no Windows como qualquer programa.</span>
              </div>
              <div className={styles.stackItem}>
                <span className={styles.stackNome}>Banco de dados local</span>
                <span className={styles.stackDesc}>SQLite — um único arquivo no computador. Rápido, confiável, sem servidor. Não precisa de internet.</span>
              </div>
              <div className={styles.stackItem}>
                <span className={styles.stackNome}>Telas do programa</span>
                <span className={styles.stackDesc}>React — cada tela é montada como peças de LEGO, o que facilita adicionar funcionalidades novas.</span>
              </div>
              <div className={styles.stackItem}>
                <span className={styles.stackNome}>Esta página web</span>
                <span className={styles.stackDesc}>Vercel + Supabase — hospedagem e banco de dados gratuitos usados só para esta tela de comunicação.</span>
              </div>
              <div className={styles.stackItem}>
                <span className={styles.stackNome}>Atualizações automáticas</span>
                <span className={styles.stackDesc}>GitHub Actions — quando Edu publica uma nova versão, o programa detecta e atualiza sozinho.</span>
              </div>
              <div className={styles.stackItem}>
                <span className={styles.stackNome}>Geração de PDF</span>
                <span className={styles.stackDesc}>Embutido no programa. O PDF do pedido é gerado localmente, sem depender de nenhum serviço externo.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Aba: Perguntas ── */}
      {abaAtiva === 'perguntas' && (
        <div className={styles.abaConteudo}>
          <p className={styles.subtitle} style={{ marginBottom: '1.5rem' }}>
            Responda as perguntas abaixo para que o desenvolvedor possa continuar o sistema.
            Você pode responder todas de uma vez ou uma por vez — salve quando quiser.
          </p>

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
      )}
    </div>
  )
}
