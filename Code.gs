// --- CONFIGURAÇÕES AVANÇADAS ---
const CACHE_FOLDER_ID = '1UWBI3h_GGeij1zkOlRL3ynRMdq1ODHw2'; 
const CACHE_FILE_NAME = 'KABUM_DASHBOARD_MASTER_CACHE_V6.json'; // V6 para forçar atualização da estrutura
const ID_PRODUCAO = '10l1w3d3HYSKFgSsnjOZ545efR-bdIECEkOR82IjV3TE'; 
const ID_CFS = '1CEexqCPUyP5b4Qra1tt5qWyBIUW0lfIoYIEvYgBFhtA'; 

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

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('KaBuM! - Produtividade & Qualidade')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

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

function updateDataCache() {
  try {
    const ssProd = SpreadsheetApp.openById(ID_PRODUCAO);
    const ssCfs = SpreadsheetApp.openById(ID_CFS);

    // Leitura das abas
    const rawCust = getSheetValues(ssProd, 'Base Customiza');
    const rawDiv = getSheetValues(ssProd, 'Divergência');
    const rawCfs = getSheetValues(ssCfs, 'Base de CFs');

    if (!rawCust || rawCust.length === 0) return { error: "Base vazia" };

    // --- INDEXAÇÃO ---
    
    // Mapa Custos
    const mapCfs = new Map();
    for(let r of rawCfs) {
      if(r[0]) {
        let val = parseFloat(String(r[17]).replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
        mapCfs.set(String(r[0]).trim().toUpperCase(), val);
      }
    }

    // Mapa Divergências
    const mapDiv = new Map();
    for(let r of rawDiv) {
      const os = String(r[5]).trim(); // Coluna F
      if(os) {
        let tipoProblemaLimpo = String(r[10]).trim();
        if (!tipoProblemaLimpo || tipoProblemaLimpo === "") tipoProblemaLimpo = "Não Classificado";
        const cfNov = String(r[17]).trim().toUpperCase(); 
        const cfAnt = String(r[15]).trim().toUpperCase();

        mapDiv.set(os, {
          prob: tipoProblemaLimpo,
          detalhe: r[4] || "",
          tec: r[1] || "N/A", // Técnico que gerou a divergência (se houver)
          avaria: r[11] || "-", 
          ofensor: cfAnt,
          custo: mapCfs.get(cfNov) || 0
        });
      }
    }

    // --- TRANSFORMAÇÃO ---
    const outputRows = [];
    
    // Mapeamento baseado nas colunas informadas pelo usuário:
    // 0:OS, 1:DataInt, 2:Status, 3:DataRec, 4:HoraRec, 5:RecPor, 6:DataIniMont, 7:HoraIniMont, 8:TecMont
    // 9:DataFimMont, 10:HoraFimMont, 11:DurMont, 12:DataIniQual, 13:HoraIniQual, 14:TecQual
    // 15:DataFimQual, 16:HoraFimQual, 17:DurQual, 18:DataNF, 19:HoraNF, 20:NumNF, 21:NFKabum, 22:Quarentena

    for(let r of rawCust) {
      const os = String(r[0]).trim();
      if(!os) continue;

      const div = mapDiv.get(os);
      const quarentena = String(r[22]).toUpperCase(); 

      // Tratamento Data ISO para Filtros
      let dataIso = null;
      let rawD = String(r[6]); // Data Início Montagem como referência principal
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
        quarentena === "SIM" ? "Quarentena" : (div ? "Divergência" : "Ok"), // 9
        
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
        div ? div.detalhe : ""               // 21 Detalhe da Divergência (Descrição)
      ]);
    }

    // --- SALVAR ---
    const payload = {
      generatedAt: new Date().toLocaleString('pt-BR'),
      data: outputRows
    };
    
    const folder = DriveApp.getFolderById(CACHE_FOLDER_ID);
    const oldFiles = folder.getFilesByName(CACHE_FILE_NAME);
    while (oldFiles.hasNext()) oldFiles.next().setTrashed(true);
    
    folder.createFile(CACHE_FILE_NAME, JSON.stringify(payload), MimeType.PLAIN_TEXT);
    return payload;

  } catch (e) {
    Logger.log("Erro ETL: " + e.stack);
    throw e;
  }
}

function getSheetValues(ss, name) {
  const s = ss.getSheetByName(name);
  if (!s) return [];
  const lr = s.getLastRow();
  const lc = s.getLastColumn();
  if (lr < 2) return [];
  return s.getRange(2, 1, lr - 1, lc).getDisplayValues(); 
}
