// --- CONFIGURAÇÕES AVANÇADAS ---
const CACHE_FOLDER_ID = '1UWBI3h_GGeij1zkOlRL3ynRMdq1ODHw2'; 
const CACHE_FILE_NAME = 'KABUM_DASHBOARD_MASTER_CACHE_V5.json'; // V5 para limpar cache antigo com valor errado
const ID_PRODUCAO = '10l1w3d3HYSKFgSsnjOZ545efR-bdIECEkOR82IjV3TE'; 
const ID_CFS = '1CEexqCPUyP5b4Qra1tt5qWyBIUW0lfIoYIEvYgBFhtA'; 

/**
 * 1. VERIFICAÇÃO DE PERMISSÕES
 */
function verificarPermissoes() {
  try {
    const folder = DriveApp.getFolderById(CACHE_FOLDER_ID);
    console.log("Acesso à Pasta: OK (" + folder.getName() + ")");
    const ss = SpreadsheetApp.openById(ID_PRODUCAO);
    console.log("Acesso à Planilha: OK (" + ss.getName() + ")");
    console.log("Permissões validadas.");
  } catch (e) {
    console.error("Erro de Permissão: " + e.message);
  }
}

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('KaBuM! - Produtividade & Qualidade')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * 2. LEITURA RÁPIDA (CACHE)
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
 * 3. PROCESSAMENTO ETL (CRÍTICO)
 */
function updateDataCache() {
  try {
    const ssProd = SpreadsheetApp.openById(ID_PRODUCAO);
    const ssCfs = SpreadsheetApp.openById(ID_CFS);

    // --- A. LEITURA EM BATCH ---
    // IMPORTANTE: getDisplayValues é crucial aqui para que a formatação monetária (R$ 1.000,00)
    // venha como texto e nossa lógica de regex funcione corretamente.
    const rawCust = getSheetValues(ssProd, 'Base Customiza');
    const rawDiv = getSheetValues(ssProd, 'Divergência');
    const rawCfs = getSheetValues(ssCfs, 'Base de CFs');

    if (!rawCust || rawCust.length === 0) return { error: "Base vazia" };

    // --- B. INDEXAÇÃO ---
    
    // Mapa Custos (Base de CFs)
    const mapCfs = new Map();
    for(let r of rawCfs) {
      if(r[0]) {
        // Limpeza segura para formato Brasileiro (R$ 1.500,90 -> 1500.90)
        let val = parseFloat(String(r[17]).replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
        mapCfs.set(String(r[0]).trim().toUpperCase(), val);
      }
    }

    // Mapa Divergências (Chave: OS)
    const mapDiv = new Map();
    for(let r of rawDiv) {
      const os = String(r[5]).trim(); // Coluna F
      
      if(os) {
        let tipoProblemaLimpo = String(r[10]).trim();
        if (!tipoProblemaLimpo || tipoProblemaLimpo === "") {
           tipoProblemaLimpo = "Não Classificado";
        }

        const cfAnt = String(r[15]).trim().toUpperCase(); // P
        const cfNov = String(r[17]).trim().toUpperCase(); // R
        
        // --- CÁLCULO DE CUSTO (APENAS CF NOVO) ---
        // Busca o custo direto do CF Novo na base de CFs
        const custo = mapCfs.get(cfNov) || 0;

        mapDiv.set(os, {
          prob: tipoProblemaLimpo,
          detalhe: r[4] || "",
          tec: r[1] || "N/A",
          avaria: r[11] || "-", 
          ofensor: cfAnt,
          custo: custo
        });
      }
    }

    // --- C. TRANSFORMAÇÃO ---
    const outputRows = [];
    
    for(let r of rawCust) {
      const os = String(r[0]).trim();
      if(!os) continue;

      const div = mapDiv.get(os);
      const quarentena = String(r[22]).toUpperCase(); // W = 22

      // Data
      let dataIso = null;
      // Como estamos usando getDisplayValues, r[6] será sempre string "DD/MM/YYYY" se formatado assim
      let rawD = String(r[6]);
      if (rawD.includes('/')) {
        let p = rawD.split('/');
        if(p.length===3) dataIso = `${p[2]}-${p[1]}-${p[0]}`;
      }

      // Hora
      let hora = "N/A";
      if(r[7]) {
        let h = String(r[7]).split(':')[0];
        if(!isNaN(parseInt(h))) hora = parseInt(h) < 10 ? `0${parseInt(h)}h` : `${h}h`;
      }

      // Status
      let status = "Sucesso";
      if (div) status = "Com Divergência";
      else if (quarentena === "SIM") status = "Quarentena";

      outputRows.push([
        os,
        dataIso,
        hora,
        r[8] || "N/A", 
        status,
        div ? div.prob : "-", 
        div ? div.avaria : "-",
        div ? div.ofensor : "-",
        div ? Number(div.custo.toFixed(2)) : 0,
        quarentena === "SIM" ? "Quarentena" : (div ? "Divergência" : "Ok")
      ]);
    }

    // --- D. SALVAR ---
    const payload = {
      generatedAt: new Date().toLocaleString('pt-BR'),
      data: outputRows
    };
    
    const folder = DriveApp.getFolderById(CACHE_FOLDER_ID);
    
    // Limpa versões antigas
    const oldFiles = folder.getFilesByName(CACHE_FILE_NAME);
    while (oldFiles.hasNext()) {
      oldFiles.next().setTrashed(true);
    }
    
    folder.createFile(CACHE_FILE_NAME, JSON.stringify(payload), MimeType.PLAIN_TEXT);
    
    return payload;

  } catch (e) {
    Logger.log("Erro ETL: " + e.stack);
    throw e;
  }
}

// CORREÇÃO CRÍTICA AQUI: Usar getDisplayValues()
function getSheetValues(ss, name) {
  const s = ss.getSheetByName(name);
  if (!s) return [];
  const lr = s.getLastRow();
  const lc = s.getLastColumn();
  if (lr < 2) return [];
  // getDisplayValues retorna o que você VÊ na planilha (Strings formatadas)
  // Isso impede que 1.500 vir 1500.0 e quebre o regex de limpeza de moeda
  return s.getRange(2, 1, lr - 1, lc).getDisplayValues(); 
}
