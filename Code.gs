/**
 * --- CONFIGURAÇÕES AVANÇADAS ---
 * IDs e Nomes de Arquivos recuperados do seu código original
 */
const CACHE_FOLDER_ID = '1UWBI3h_GGeij1zkOlRL3ynRMdq1ODHw2'; 
const CACHE_FILE_NAME = 'KABUM_DASHBOARD_MASTER_CACHE_V6.json'; // V6 para forçar atualização
const ID_PRODUCAO = '10l1w3d3HYSKFgSsnjOZ545efR-bdIECEkOR82IjV3TE'; 
const ID_CFS = '1CEexqCPUyP5b4Qra1tt5qWyBIUW0lfIoYIEvYgBFhtA'; 

/**
 * Função para debug de permissões (opcional, mas útil)
 */
function verificarPermissoes() {
  try {
    const folder = DriveApp.getFolderById(CACHE_FOLDER_ID);
    console.log("Acesso à Pasta: OK (" + folder.getName() + ")");
    const ss = SpreadsheetApp.openById(ID_PRODUCAO);
    console.log("Acesso à Planilha: OK (" + ss.getName() + ")");
  } catch (e) {
    console.error("Erro de Permissão: " + e.message);
  }
}

/**
 * Renderiza o Web App
 */
function doGet() {
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('KaBuM! - Produtividade & Qualidade')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * --- ESSENCIAL ---
 * Função necessária para incluir os arquivos CSS e JS separados no Index.html
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Busca o JSON no Drive ou gera novo se não existir
 */
function getCachedData() {
  try {
    const folder = DriveApp.getFolderById(CACHE_FOLDER_ID);
    const files = folder.getFilesByName(CACHE_FILE_NAME);
    
    if (files.hasNext()) {
      const file = files.next();
      return JSON.parse(file.getBlob().getDataAsString());
    } else {
      return updateDataCache(); 
    }
  } catch (e) {
    throw new Error("Erro ao ler cache: " + e.message);
  }
}

/**
 * Gera a base de dados cruzando as planilhas (ETL)
 */
function updateDataCache() {
  try {
    const ssProd = SpreadsheetApp.openById(ID_PRODUCAO);
    const ssCfs = SpreadsheetApp.openById(ID_CFS);

    // Leitura das abas
    const rawCust = getSheetValues(ssProd, 'Base Customiza');
    const rawDiv = getSheetValues(ssProd, 'Divergência');
    const rawCfs = getSheetValues(ssCfs, 'Base de CFs');
    const rawCons = getSheetValues(ssCfs, 'Considerações'); // Nova aba de Considerações

    if (!rawCust || rawCust.length === 0) return { error: "Base vazia" };

    // --- INDEXAÇÃO (Base de CFs Nova Estrutura) ---
    // Colunas esperadas: 
    // 0: Código, 1: Descrição, 2: Fabricante, 3: Fornecedor, 4: Valor Unitário (Coluna E)
    
    const mapCfs = new Map();
    for(let r of rawCfs) {
      if(r[0]) {
        // Tratamento do Valor (Coluna E / Index 4)
        let val = 0;
        if (typeof r[4] === 'number') {
          val = r[4];
        } else {
          // Limpeza caso venha como texto "R$ 1.200,00"
          val = parseFloat(String(r[4]).replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
        }

        // Tratamento da Descrição (Coluna B / Index 1)
        let desc = String(r[1]).trim();
        // Se a descrição estiver vazia, usa o código como fallback
        if (!desc) desc = String(r[0]).trim();

        mapCfs.set(String(r[0]).trim().toUpperCase(), {
          custo: val,
          nome: desc
        });
      }
    }

    // --- Mapa Considerações (ATUALIZADO PARA ÍNDICE 2) ---
    // Estrutura da aba: Coluna A (0)=OS, Coluna B (1)=Data, Coluna C (2)=Consideração
    const mapCons = new Map();
    if (rawCons && rawCons.length > 0) {
      for (let r of rawCons) {
        if (r[0]) { // Se tiver número de OS
          const osKey = String(r[0]).trim().toUpperCase();
          const consDesc = String(r[2]).trim(); // <--- CORREÇÃO AQUI: Índice 2 (Coluna C)
          
          if (osKey && consDesc) {
            mapCons.set(osKey, consDesc);
          }
        }
      }
    }

    // --- Mapa Divergências ---
    const mapDiv = new Map();
    for(let r of rawDiv) {
      const os = String(r[5]).trim(); // Coluna F
      if(os) {
        let tipoProblemaLimpo = String(r[10]).trim();
        if (!tipoProblemaLimpo || tipoProblemaLimpo === "") tipoProblemaLimpo = "Não Classificado";
        
        const cfNov = String(r[17]).trim().toUpperCase(); 
        const cfAnt = String(r[15]).trim().toUpperCase(); // Código do ofensor (peça trocada)

        // Busca dados na base de CFs
        const dadosCfNov = mapCfs.get(cfNov);
        const dadosCfAnt = mapCfs.get(cfAnt);

        // Define o nome do ofensor: Se achar na base, usa o nome. Se não, usa o código.
        const nomeOfensor = dadosCfAnt ? dadosCfAnt.nome : cfAnt;
        const custoDivergencia = dadosCfNov ? dadosCfNov.custo : 0;

        mapDiv.set(os, {
          prob: tipoProblemaLimpo,
          detalhe: r[4] || "",
          tec: r[1] || "N/A", // Técnico que gerou a divergência
          avaria: r[11] || "-", 
          ofensor: nomeOfensor, // Nome do Item
          custo: custoDivergencia
        });
      }
    }

    // --- TRANSFORMAÇÃO ---
    const outputRows = [];
    
    // Iteração principal sobre a Base Customiza
    for(let r of rawCust) {
      const os = String(r[0]).trim();
      if(!os) continue;

      const div = mapDiv.get(os);
      const quarentena = String(r[22]).toUpperCase(); 
      const consManual = mapCons.get(os.toUpperCase()); // Busca na aba Considerações

      // Tratamento Data ISO para Filtros
      let dataIso = null;
      let rawD = String(r[6]); // Data Início Montagem como referência
      if (rawD.includes('/')) {
        let p = rawD.split('/');
        if(p.length===3) dataIso = `${p[2]}-${p[1]}-${p[0]}`;
      }

      // Hora Principal
      let hora = "N/A";
      if(r[7]) {
        let h = String(r[7]).split(':')[0];
        if(!isNaN(parseInt(h))) hora = parseInt(h) < 10 ? `0${parseInt(h)}h` : `${h}h`;
      }

      // Status Geral Logico
      let statusGeral = "Sucesso";
      if (div) statusGeral = "Com Divergência";
      else if (quarentena === "SIM") statusGeral = "Quarentena";

      // Lógica de Prioridade para o campo CONSIDERAÇÕES (Index 9)
      // 1. Consideração Manual (Aba Considerações, coluna C)
      // 2. Quarentena (Base Customiza)
      // 3. Divergência (Aba Divergência)
      // 4. Ok
      let consideracaoFinal = "Ok";
      
      if (consManual) {
        consideracaoFinal = consManual; // Prioridade máxima
      } else if (quarentena === "SIM") {
        consideracaoFinal = "Quarentena";
      } else if (div) {
        consideracaoFinal = "Divergência";
      }

      outputRows.push([
        // --- CAMPOS ORIGINAIS DO DASHBOARD (Indices 0-9) ---
        os,                                  // 0
        dataIso,                             // 1
        hora,                                // 2
        r[8] || "N/A",                       // 3 (Técnico Montagem)
        statusGeral,                         // 4
        div ? div.prob : "-",                // 5
        div ? div.avaria : "-",              // 6
        div ? div.ofensor : "-",             // 7
        div ? Number(div.custo.toFixed(2)) : 0, // 8
        consideracaoFinal,                   // 9 (Considerações para o Card)
        
        // --- NOVOS CAMPOS PARA O DOSSIÊ (Indices 10+) ---
        r[5] || "-",                         // 10 Recebido Por
        `${r[3]} ${r[4]}`,                   // 11 Data/Hora Recebimento
        `${r[6]} ${r[7]}`,                   // 12 Data/Hora Inicio Montagem
        `${r[9]} ${r[10]}`,                  // 13 Data/Hora Fim Montagem
        r[11] || "-",                        // 14 Duração Montagem
        r[14] || "N/A",                      // 15 Técnico Qualidade
        `${r[12]} ${r[13]}`,                 // 16 Data/Hora Inicio Qualidade
        `${r[15]} ${r[16]}`,                 // 17 Data/Hora Fim Qualidade
        r[17] || "-",                        // 18 Duração Qualidade
        r[20] || "-",                        // 19 Número NF OS
        `${r[18]} ${r[19]}`,                 // 20 Data/Hora Emissão NF
        div ? div.detalhe : ""               // 21 Detalhe da Divergência
      ]);
    }

    // --- SALVAR NO DRIVE ---
    const payload = {
      generatedAt: new Date().toLocaleString('pt-BR'),
      data: outputRows
    };
    
    const folder = DriveApp.getFolderById(CACHE_FOLDER_ID);
    const oldFiles = folder.getFilesByName(CACHE_FILE_NAME);
    
    // Remove arquivos antigos para evitar lixo/duplicata
    while (oldFiles.hasNext()) oldFiles.next().setTrashed(true);
    
    // Cria novo arquivo cache
    folder.createFile(CACHE_FILE_NAME, JSON.stringify(payload), MimeType.PLAIN_TEXT);
    return payload;

  } catch (e) {
    Logger.log("Erro ETL: " + e.stack);
    throw e;
  }
}

/**
 * Função auxiliar para pegar dados da planilha de forma segura
 */
function getSheetValues(ss, name) {
  const s = ss.getSheetByName(name);
  if (!s) return [];
  const lr = s.getLastRow();
  const lc = s.getLastColumn();
  if (lr < 2) return []; // Se só tiver cabeçalho ou vazio
  return s.getRange(2, 1, lr - 1, lc).getDisplayValues(); 
}
