// electron/preload/index.js
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  colecoes: {
    list:      ()           => ipcRenderer.invoke('colecoes:list'),
    create:    (d)          => ipcRenderer.invoke('colecoes:create', d),
    setStatus: (id, status) => ipcRenderer.invoke('colecoes:setStatus', id, status),
  },
  segmentacoes: {
    list:   ()        => ipcRenderer.invoke('segmentacoes:list'),
    create: (d)       => ipcRenderer.invoke('segmentacoes:create', d),
    upsert: (d)       => ipcRenderer.invoke('segmentacoes:upsert', d),
    update: (id, d)   => ipcRenderer.invoke('segmentacoes:update', id, d),
    remove: (id)      => ipcRenderer.invoke('segmentacoes:remove', id),
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
    list:            ()          => ipcRenderer.invoke('fornecedores:list'),
    create:          (d)         => ipcRenderer.invoke('fornecedores:create', d),
    update:          (id, d)     => ipcRenderer.invoke('fornecedores:update', id, d),
    remove:          (id)        => ipcRenderer.invoke('fornecedores:remove', id),
    importarArquivo: (filePath)  => ipcRenderer.invoke('fornecedores:importarArquivo', filePath),
  },
  compradores: {
    list:   ()       => ipcRenderer.invoke('compradores:list'),
    create: (d)      => ipcRenderer.invoke('compradores:create', d),
    update: (id, d)  => ipcRenderer.invoke('compradores:update', id, d),
    remove: (id)     => ipcRenderer.invoke('compradores:remove', id),
  },
  sessoes: {
    create: (d, lojaIds) => ipcRenderer.invoke('sessoes:create', d, lojaIds),
    list:   (colId)      => ipcRenderer.invoke('sessoes:list', colId),
    byId:   (id)         => ipcRenderer.invoke('sessoes:byId', id),
  },
  visitas: {
    create: (d)     => ipcRenderer.invoke('visitas:create', d),
    list:   (colId) => ipcRenderer.invoke('visitas:list', colId),
    byId:   (id)    => ipcRenderer.invoke('visitas:byId', id),
  },
  pedidos: {
    salvar:             (d)             => ipcRenderer.invoke('pedidos:salvar', d),
    byVisita:           (visitaId)      => ipcRenderer.invoke('pedidos:byVisita', visitaId),
    totaisPorTamanho:   (segId, colId)  => ipcRenderer.invoke('pedidos:totaisPorTamanho', segId, colId),
    totaisPorFornecedor:(colId, segId)  => ipcRenderer.invoke('pedidos:totaisPorFornecedor', colId, segId),
    itensPorFornecedor: (fornId, colId) => ipcRenderer.invoke('pedidos:itensPorFornecedor', fornId, colId),
    cancelar:           (id)            => ipcRenderer.invoke('pedidos:cancelar', id),
    salvarBatch:        (data)          => ipcRenderer.invoke('pedidos:salvarBatch', data),
  },
  dashboard: {
    data: (colId) => ipcRenderer.invoke('dashboard:data', colId),
  },
  backup: {
    export: () => ipcRenderer.invoke('backup:export'),
    import: () => ipcRenderer.invoke('backup:import'),
  },
  dialog: {
    openFile: (options) => ipcRenderer.invoke('dialog:openFile', options),
  },
  updater: {
    install:  ()   => ipcRenderer.invoke('updater:install'),
    onStatus: (cb) => {
      const handler = (_, s) => cb(s)
      ipcRenderer.on('updater:status', handler)
      return () => ipcRenderer.removeListener('updater:status', handler)
    },
  }
})
