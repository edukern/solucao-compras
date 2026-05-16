// electron/preload/index.js
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  colecoes: {
    list:      ()           => ipcRenderer.invoke('colecoes:list'),
    create:    (d)          => ipcRenderer.invoke('colecoes:create', d),
    setStatus: (id, status) => ipcRenderer.invoke('colecoes:setStatus', id, status),
  },
  segmentacoes: {
    list:   ()  => ipcRenderer.invoke('segmentacoes:list'),
    create: (d) => ipcRenderer.invoke('segmentacoes:create', d),
    upsert: (d) => ipcRenderer.invoke('segmentacoes:upsert', d),
  },
  grades: {
    save: (segId, colId, rows) => ipcRenderer.invoke('grades:save', segId, colId, rows),
    get:  (segId, colId)       => ipcRenderer.invoke('grades:get', segId, colId),
  },
  projecoes: {
    calcular:  (segId, colId, baseIds, metodo) => ipcRenderer.invoke('projecoes:calcular', segId, colId, baseIds, metodo),
    salvar:    (segId, colId, rows, metodo)    => ipcRenderer.invoke('projecoes:salvar', segId, colId, rows, metodo),
    get:       (segId, colId)                  => ipcRenderer.invoke('projecoes:get', segId, colId),
    ajustar:   (segId, colId, tamanho, qtd)   => ipcRenderer.invoke('projecoes:ajustar', segId, colId, tamanho, qtd),
    restaurar: (segId, colId, tamanho)         => ipcRenderer.invoke('projecoes:restaurar', segId, colId, tamanho),
  },
  fornecedores: {
    list:   ()       => ipcRenderer.invoke('fornecedores:list'),
    create: (d)      => ipcRenderer.invoke('fornecedores:create', d),
    update: (id, d)  => ipcRenderer.invoke('fornecedores:update', id, d),
  },
  pedidos: {
    salvar:           (d)            => ipcRenderer.invoke('pedidos:salvar', d),
    totaisPorTamanho: (segId, colId) => ipcRenderer.invoke('pedidos:totaisPorTamanho', segId, colId),
    listarVisitas:    (colId)        => ipcRenderer.invoke('pedidos:listarVisitas', colId),
    listarPorColecao: (colId)        => ipcRenderer.invoke('pedidos:listarPorColecao', colId),
    totaisPorFornecedor:   (colId, segId) => ipcRenderer.invoke('pedidos:totaisPorFornecedor', colId, segId),
    itensPorFornecedor:    (fornId, colId) => ipcRenderer.invoke('pedidos:itensPorFornecedor', fornId, colId),
  },
  backup: {
    export: () => ipcRenderer.invoke('backup:export'),
    import: () => ipcRenderer.invoke('backup:import'),
  },
  dialog: {
    openFile: (options) => ipcRenderer.invoke('dialog:openFile', options),
  }
})
