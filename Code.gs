<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <base target="_top">
    <meta charset="utf-8">
    <title>KaBuM! Dashboard</title>
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    
    <style>
      /* --- DESIGN SYSTEM --- */
      :root {
        --bg-dark: #121214; --card-bg: #1A1A1E; --kabum-orange: #FF6500; --kabum-blue: #0060B1; 
        --text-primary: #FFFFFF; --text-secondary: #A8A8B3; --border-color: rgba(255, 255, 255, 0.1); --modal-bg: #1A1A1E;
        --success-green: #00C851; --danger-red: #ff4444;
      }
      body { background-color: var(--bg-dark); color: var(--text-primary); font-family: 'Poppins', sans-serif; overflow-x: hidden; }
      h1, h2, h3, h4, h5, .tech-font { font-family: 'Chakra Petch', sans-serif; text-transform: uppercase; letter-spacing: 1px; }

      /* Loading */
      #loading-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: radial-gradient(circle at center, #1a1a1a 0%, #000000 100%); z-index: 9999; display: flex; flex-direction: column; justify-content: center; align-items: center; }
      .neon-logo { font-size: 5rem; font-weight: 700; color: transparent; -webkit-text-stroke: 2px var(--kabum-orange); text-shadow: 0 0 20px var(--kabum-orange); animation: flicker 2s infinite alternate; }
      .loading-bar { width: 300px; height: 4px; background: #333; margin-top: 30px; position: relative; overflow: hidden; }
      .loading-fill { position: absolute; left: 0; top: 0; height: 100%; background: var(--kabum-orange); width: 0%; transition: width 0.3s; }

      /* Navbar */
      .navbar { background: rgba(26, 26, 30, 0.95); border-bottom: 2px solid var(--kabum-orange); padding: 1rem 0; z-index: 1000; }
      .period-container { position: relative; }
      .btn-period-trigger { background: transparent; border: 1px solid var(--border-color); color: var(--text-primary); font-family: 'Chakra Petch'; font-weight: 600; padding: 8px 15px; border-radius: 6px; display: flex; align-items: center; gap: 10px; transition: 0.3s; min-width: 200px; justify-content: space-between; }
      .btn-period-trigger:hover, .btn-period-trigger.active { border-color: var(--kabum-orange); background: rgba(255, 101, 0, 0.1); color: white; }
      .period-dropdown-menu { position: absolute; top: 110%; left: 0; background: var(--card-bg); border: 1px solid var(--kabum-orange); border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.8); z-index: 1001; display: flex; overflow: hidden; min-width: 300px; animation: slideDown 0.2s ease-out; }
      .period-col { padding: 10px; display: flex; flex-direction: column; gap: 5px; max-height: 400px; overflow-y: auto; }
      .period-col-left { border-right: 1px solid var(--border-color); flex: 1; }
      .period-col-right { width: 100px; background: rgba(0,0,0,0.2); }
      .period-header { font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 5px; padding-left: 8px; font-family: 'Chakra Petch'; }
      .btn-period-item { background: transparent; border: none; color: #ccc; text-align: left; padding: 6px 12px; border-radius: 4px; font-size: 0.9rem; font-family: 'Poppins'; transition: 0.2s; width: 100%; }
      .btn-period-item:hover { background: rgba(255,255,255,0.05); color: white; }
      .btn-period-item.active { background: var(--kabum-orange); color: white; font-weight: 600; }
      .btn-period-item.year-item { text-align: center; }

      /* Cards & UI */
      .tech-card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 4px; padding: 20px; height: 100%; transition: 0.3s; position: relative; }
      .tech-card:hover { border-color: var(--kabum-orange); transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
      .clickable-card { cursor: pointer; }
      .card-header-tech { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 15px; margin-bottom: 15px; }
      .card-title { font-size: 1rem; color: #E0E0E0; font-weight: 600; text-transform: uppercase; }
      .click-hint { position: absolute; bottom: 15px; right: 15px; font-size: 0.75rem; color: var(--kabum-orange); opacity: 0; transition: 0.3s; font-family: 'Chakra Petch'; text-transform: uppercase; }
      .clickable-card:hover .click-hint { opacity: 1; }
      .kpi-big { font-size: 2.5rem; font-weight: 700; line-height: 1; }
      .kpi-sub { font-size: 0.8rem; color: var(--text-secondary); margin-top: 5px; }

      /* Table & Modal */
      .table-tech { width: 100%; border-collapse: separate; border-spacing: 0 4px; }
      .table-tech th { color: var(--kabum-orange); font-family: 'Chakra Petch'; padding: 10px; font-size: 0.8rem; border-bottom: 1px solid var(--border-color); }
      .table-tech td { background: rgba(255,255,255,0.03); padding: 10px; font-size: 0.9rem; color: #ddd; }
      .table-tech tr:hover td { background: rgba(0, 150, 255, 0.1); color: white; border-left: 2px solid var(--kabum-orange); }
      .table-clickable tbody tr { cursor: pointer; }
      .table-tech tfoot td { background: rgba(255, 101, 0, 0.1); color: white; font-weight: 700; border-top: 1px solid var(--kabum-orange); }
      .modal-content { background-color: var(--modal-bg); border: 1px solid var(--kabum-blue); color: var(--text-primary); }
      .btn-close { filter: invert(1); }
      .badge-custom { padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; border: 1px solid currentColor; }
      .modal-stat-card { background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 15px; text-align: center; }
      .modal-stat-val { font-size: 1.5rem; font-weight: 700; color: white; }
      .modal-stat-label { font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; }

      .nav-tabs-c { display: flex; gap: 15px; border-bottom: 1px solid var(--border-color); margin-bottom: 25px; }
      .tab-item { background: none; border: none; color: var(--text-secondary); padding: 10px 20px; font-family: 'Chakra Petch'; font-weight: 600; cursor: pointer; transition: 0.3s; border-bottom: 3px solid transparent; }
      .tab-item.active { color: var(--kabum-orange); border-bottom-color: var(--kabum-orange); text-shadow: 0 0 10px rgba(255, 101, 0, 0.3); }
      .tab-item:hover { color: white; }

      /* DOSSIÊ / HISTÓRICO STYLES */
      .timeline-container { position: relative; padding: 20px 0; }
      .timeline-container::before { content: ''; position: absolute; left: 20px; top: 0; bottom: 0; width: 2px; background: rgba(255,255,255,0.1); }
      .timeline-item { position: relative; padding-left: 50px; margin-bottom: 40px; }
      .timeline-icon { position: absolute; left: 0; top: 0; width: 40px; height: 40px; border-radius: 50%; background: var(--card-bg); border: 2px solid var(--kabum-blue); display: flex; align-items: center; justify-content: center; z-index: 2; color: var(--text-primary); }
      .timeline-icon.success { border-color: var(--success-green); color: var(--success-green); box-shadow: 0 0 10px rgba(0,200,81,0.2); }
      .timeline-icon.danger { border-color: var(--danger-red); color: var(--danger-red); box-shadow: 0 0 10px rgba(255,68,68,0.2); }
      .timeline-icon.warning { border-color: var(--kabum-orange); color: var(--kabum-orange); box-shadow: 0 0 10px rgba(255,101,0,0.2); }
      
      .timeline-content { background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 6px; padding: 15px; position: relative; }
      .timeline-content::before { content: ''; position: absolute; left: -8px; top: 12px; width: 15px; height: 15px; background: inherit; border-left: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); transform: rotate(45deg); }
      
      .t-label { font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; }
      .t-value { font-size: 1rem; color: white; font-weight: 500; }
      .t-time { font-family: 'Chakra Petch'; font-size: 0.9rem; color: var(--kabum-orange); text-align: right; }
      
      .search-box input { background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: white; padding: 12px 20px; border-radius: 6px; width: 100%; font-family: 'Chakra Petch'; }
      .search-box input:focus { outline: none; border-color: var(--kabum-orange); box-shadow: 0 0 15px rgba(255,101,0,0.1); }
      .search-box input::placeholder { color: rgba(255,255,255,0.7) !important; opacity: 1; }

      @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes flicker { 0%, 100% { opacity: 1; text-shadow: 0 0 20px var(--kabum-orange); } 50% { opacity: 0.8; text-shadow: 0 0 5px var(--kabum-orange); } }
    </style>
  </head>
  <body>

    <div id="app" @click="closeDropdownOnClickOutside">
      <div id="loading-overlay" v-if="loading">
        <div class="neon-logo tech-font">KaBuM!</div>
        <div class="text-white mt-3 tech-font" style="letter-spacing: 5px;">Vem pro Game, KaBuM!</div>
        <div class="loading-bar"><div class="loading-fill" :style="{ width: loadProgress + '%' }"></div></div>
        <div class="text-secondary mt-3 small" v-if="loadingMessage">{{ loadingMessage }}</div>
        <button v-if="showErrorBtn" class="btn btn-sm btn-outline-danger mt-3" @click="forceRefresh">Tentar Forçar Cache</button>
      </div>

      <div :style="{ opacity: loading ? 0 : 1, transition: 'opacity 0.8s' }">
        <nav class="navbar sticky-top">
          <div class="container-fluid px-4 flex-column align-items-stretch">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div class="d-flex align-items-center">
                <i class="fas fa-microchip fa-2x me-3" style="color: var(--kabum-orange);"></i>
                <div>
                  <div class="tech-font text-white fw-bold fs-4">DASHBOARD ANALÍTICO</div>
                  <div class="small text-secondary">PRODUTIVIDADE & QUALIDADE</div>
                </div>
              </div>
              <div class="d-flex gap-3 align-items-center">
                <div class="period-container" @click.stop v-if="view !== 'dossie'">
                   <button class="btn-period-trigger" @click="showPeriodDropdown = !showPeriodDropdown" :class="{ active: showPeriodDropdown }">
                      <span><i class="far fa-calendar-alt me-2"></i> {{ periodLabel }}</span>
                      <i class="fas fa-chevron-down ms-2" style="font-size: 0.8rem"></i>
                   </button>
                   <div class="period-dropdown-menu" v-if="showPeriodDropdown">
                      <div class="period-col period-col-left">
                         <div class="period-header">SELECIONE O MÊS</div>
                         <button class="btn-period-item" :class="{ active: currentMonthIdx === -1 }" @click="selectMonth(-1)">ANO COMPLETO</button>
                         <button v-for="(m, i) in months" :key="i" class="btn-period-item" :class="{ active: currentMonthIdx === i }" @click="selectMonth(i)">{{ m }}</button>
                      </div>
                      <div class="period-col period-col-right">
                         <div class="period-header">ANO</div>
                         <button v-for="y in years" :key="y" class="btn-period-item year-item" :class="{ active: selectedYear === y }" @click="selectYear(y)">{{ y }}</button>
                      </div>
                   </div>
                </div>
                <button class="btn btn-sm btn-outline-warning tech-font" @click="forceRefresh">
                  <i class="fas fa-sync me-2"></i> RECARREGAR BASE
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div class="container-fluid px-4 mt-4 pb-5">
          
          <div class="nav-tabs-c">
            <button class="tab-item" :class="{ active: view === 'geral' }" @click="view = 'geral'">VISÃO GERAL</button>
            <button class="tab-item" :class="{ active: view === 'financeiro' }" @click="view = 'financeiro'">FINANCEIRO</button>
            <button class="tab-item" :class="{ active: view === 'quarentena' }" @click="view = 'quarentena'">QUARENTENA</button>
            <button class="tab-item" :class="{ active: view === 'dossie' }" @click="view = 'dossie'">HISTÓRICO DA MÁQUINA</button>
          </div>

          <!-- MENSAGEM QUANDO VAZIO (Exceto Dossiê que tem busca própria) -->
          <div v-if="!loading && filteredData.length === 0 && view !== 'dossie'" class="alert alert-warning text-center p-5 tech-font">
            <i class="fas fa-search fa-3x mb-3"></i><br>
            NENHUM REGISTRO ENCONTRADO.<br>
            <small class="text-white">Base atualizada em: {{ lastUpdate }}</small>
          </div>

          <div v-else>
            
            <!-- VIEW: DOSSIÊ (NOVA) -->
            <div v-if="view === 'dossie'">
              <div class="row justify-content-center">
                <div class="col-md-8 col-lg-6">
                  <div class="search-box mb-5">
                    <div class="input-group">
                      <span class="input-group-text bg-transparent border-end-0 border-secondary"><i class="fas fa-search text-secondary"></i></span>
                      <input type="text" v-model="searchOS" @keyup.enter="searchMachine" class="form-control border-start-0" placeholder="Digite o número da OS para buscar o histórico completo..." style="background: rgba(255,255,255,0.05); color:white; border-color: rgba(255,255,255,0.1);">
                      <button class="btn btn-warning tech-font" @click="searchMachine">BUSCAR</button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="dossieData" class="row animate__animated animate__fadeIn">
                <!-- Cabeçalho do Dossiê -->
                <div class="col-12 mb-4">
                  <div class="tech-card d-flex justify-content-between align-items-center" style="border-left: 5px solid var(--kabum-blue);">
                    <div>
                      <div class="text-secondary small tech-font">HISTÓRICO TÉCNICO DA ORDEM DE SERVIÇO</div>
                      <div class="display-4 fw-bold text-white">{{ dossieData.os }}</div>
                    </div>
                    <div class="text-end">
                      <span class="badge" :class="getBadgeClass(dossieData.status)" style="font-size: 1rem;">{{ dossieData.status }}</span>
                      <div class="mt-2 text-warning small tech-font" v-if="dossieData.temDivergencia">CUSTO GERADO: {{ formatBRL(dossieData.custo) }}</div>
                    </div>
                  </div>
                </div>

                <!-- Detalhes do Problema (Se houver) -->
                <div class="col-12 mb-4" v-if="dossieData.temDivergencia">
                  <div class="alert alert-danger d-flex align-items-center" style="background: rgba(255, 68, 68, 0.1); border: 1px solid var(--danger-red);">
                    <i class="fas fa-exclamation-triangle fa-2x me-3 text-danger"></i>
                    <div>
                      <div class="fw-bold text-danger tech-font">OCORRÊNCIA DE DIVERGÊNCIA REGISTRADA</div>
                      <div><strong>Problema:</strong> {{ dossieData.problemaGeral }} | <strong>Avaria:</strong> {{ dossieData.avariaCustomiza }}</div>
                      <div class="small mt-1 text-white-50">"{{ dossieData.detalheDivergencia }}"</div>
                    </div>
                  </div>
                </div>

                <!-- Timeline Vertical -->
                <div class="col-lg-8 offset-lg-2">
                  <div class="timeline-container">
                    
                    <!-- Passo 1: Recebimento -->
                    <div class="timeline-item">
                      <div class="timeline-icon success"><i class="fas fa-box-open"></i></div>
                      <div class="timeline-content">
                        <div class="row">
                          <div class="col-8">
                            <h5 class="text-white tech-font mb-3">1. RECEBIMENTO</h5>
                            <div class="t-label">RECEBIDO POR</div>
                            <div class="t-value">{{ dossieData.recebidoPor }}</div>
                          </div>
                          <div class="col-4 text-end">
                            <div class="t-time">{{ dossieData.dataHoraRecebimento }}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Passo 2: Montagem -->
                    <div class="timeline-item">
                      <div class="timeline-icon warning"><i class="fas fa-tools"></i></div>
                      <div class="timeline-content">
                        <div class="row">
                          <div class="col-8">
                            <h5 class="text-white tech-font mb-3">2. MONTAGEM</h5>
                            <div class="mb-2">
                              <div class="t-label">TÉCNICO RESPONSÁVEL</div>
                              <div class="t-value text-warning">{{ dossieData.tecnico }}</div>
                            </div>
                            <div class="d-flex gap-4">
                              <div><div class="t-label">INÍCIO</div><div class="text-white">{{ dossieData.dataHoraIniMont }}</div></div>
                              <div><div class="t-label">FIM</div><div class="text-white">{{ dossieData.dataHoraFimMont }}</div></div>
                            </div>
                          </div>
                          <div class="col-4 text-end d-flex flex-column justify-content-between">
                             <div class="badge bg-dark border border-secondary">{{ dossieData.duracaoMont }} Duração</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- TIMELINE ITEM EXTRA: DIVERGÊNCIA (SE HOUVER) -->
                    <div class="timeline-item" v-if="dossieData.temDivergencia">
                      <div class="timeline-icon danger"><i class="fas fa-exclamation-triangle"></i></div>
                      <div class="timeline-content" style="border-color: var(--danger-red);">
                        <h5 class="text-danger tech-font mb-2">OCORRÊNCIA DE DIVERGÊNCIA</h5>
                        <div class="mb-2">
                          <div class="t-label">PROBLEMA IDENTIFICADO</div>
                          <div class="t-value text-white">{{ dossieData.problemaGeral }}</div>
                        </div>
                        <div class="mb-2">
                           <div class="t-label">AVARIA</div>
                           <div class="t-value text-white">{{ dossieData.avariaCustomiza }}</div>
                        </div>
                        <div class="mt-2 p-2 rounded" style="background: rgba(255, 68, 68, 0.1);">
                           <small class="text-white-50 fst-italic">"{{ dossieData.detalheDivergencia }}"</small>
                        </div>
                        <div class="text-end mt-2">
                           <div class="badge bg-danger">Custo: {{ formatBRL(dossieData.custo) }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- Passo 3: Qualidade -->
                    <div class="timeline-item">
                      <div class="timeline-icon" style="border-color: #00f2ff; color: #00f2ff;"><i class="fas fa-clipboard-check"></i></div>
                      <div class="timeline-content">
                        <div class="row">
                          <div class="col-8">
                            <h5 class="text-white tech-font mb-3">3. QUALIDADE / TESTES</h5>
                            <div class="mb-2">
                              <div class="t-label">ANALISTA DE QUALIDADE</div>
                              <div class="t-value" style="color: #00f2ff;">{{ dossieData.tecQualidade }}</div>
                            </div>
                             <div class="d-flex gap-4">
                              <div><div class="t-label">INÍCIO</div><div class="text-white">{{ dossieData.dataHoraIniQual }}</div></div>
                              <div><div class="t-label">FIM</div><div class="text-white">{{ dossieData.dataHoraFimQual }}</div></div>
                            </div>
                          </div>
                          <div class="col-4 text-end">
                            <div class="badge bg-dark border border-secondary">{{ dossieData.duracaoQual }} Duração</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Passo 4: Faturamento -->
                    <div class="timeline-item">
                      <div class="timeline-icon success"><i class="fas fa-truck"></i></div>
                      <div class="timeline-content">
                        <div class="row">
                          <div class="col-8">
                            <h5 class="text-white tech-font mb-3">4. FATURAMENTO</h5>
                            <div class="t-label">NOTA FISCAL (OS / KABUM)</div>
                            <div class="t-value">{{ dossieData.numNF }}</div>
                          </div>
                          <div class="col-4 text-end">
                            <div class="t-time">{{ dossieData.dataHoraNF }}</div>
                            <i class="fas fa-check-circle text-success mt-2 fa-2x"></i>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
              
              <div v-else-if="searchPerformed" class="text-center mt-5">
                <i class="fas fa-ghost fa-3x text-secondary mb-3"></i>
                <h4 class="text-secondary tech-font">OS NÃO ENCONTRADA NA BASE</h4>
                <p class="text-muted">Verifique o número e tente novamente.</p>
              </div>

            </div>

            <!-- DASHBOARD GERAL (Existente) -->
            <div v-if="view === 'geral'">
              <div class="row g-4 mb-4">
                <div class="col-md-3">
                  <div class="tech-card clickable-card" @click="scrollTo('chart-tecnicos')">
                    <div class="card-header-tech"><span class="card-title">TOTAL OS (PRODUÇÃO)</span><i class="fas fa-clipboard-list text-muted"></i></div>
                    <div class="kpi-big">{{ kpi.total }}</div>
                    <div class="kpi-sub">Montagens no período</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="tech-card" style="border-bottom: 2px solid var(--kabum-orange);">
                    <div class="card-header-tech"><span class="card-title" style="color: var(--kabum-orange)">TAXA DIVERGÊNCIA</span><i class="fas fa-percentage text-muted"></i></div>
                    <div class="kpi-big">{{ kpi.taxa }}<small>%</small></div>
                    <div class="kpi-sub">{{ kpi.divCount }} Com problemas</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="tech-card clickable-card">
                    <div class="card-header-tech"><span class="card-title text-warning">MAIOR OFENSOR</span><i class="fas fa-exclamation-triangle text-warning"></i></div>
                    <div class="d-flex justify-content-between align-items-end">
                      <div class="fs-4 fw-bold text-info">{{ kpi.ofensor }}</div>
                      <div class="text-end text-white tech-font">{{ kpi.ofensorCount }} <small>OCORRÊNCIAS</small></div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="row g-4">
                <div class="col-md-8">
                  <div class="tech-card clickable-card">
                    <div class="card-header-tech"><span class="card-title">PRODUTIVIDADE POR TÉCNICO</span></div>
                    <div id="chart-tecnicos"></div>
                    <div class="click-hint">Clique para detalhes</div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="tech-card clickable-card">
                    <div class="card-header-tech"><span class="card-title">INCIDÊNCIA POR HORA</span></div>
                    <div id="chart-horas"></div>
                    <div class="click-hint">Clique para detalhes</div>
                  </div>
                </div>
                <div class="col-12">
                  <div class="tech-card">
                    <div class="card-header-tech"><span class="card-title">LINHA DO TEMPO</span></div>
                    <div id="chart-timeline"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- FINANCEIRO (Existente) -->
            <div v-if="view === 'financeiro'">
              <div class="row g-4 mb-4">
                <div class="col-md-4">
                  <div class="tech-card h-100 d-flex flex-column justify-content-center" style="border-color: var(--kabum-orange);">
                    <div class="text-center">
                      <div class="card-title mb-3" style="color: var(--kabum-orange)">CUSTO TOTAL (DIVERGÊNCIA)</div>
                      <div class="kpi-big" style="font-size: 3.5rem; color: var(--kabum-orange)">{{ formatBRL(kpi.custo) }}</div>
                      <div class="kpi-sub">Custo Total (CF Novo)</div>
                    </div>
                  </div>
                </div>
                <div class="col-md-8">
                  <div class="tech-card">
                    <div class="card-header-tech"><span class="card-title">CUSTO POR PROBLEMA</span></div>
                    <div id="chart-custos"></div>
                  </div>
                </div>
              </div>

              <div class="row g-4">
                <div class="col-md-6">
                  <div class="tech-card">
                    <div class="card-header-tech">
                      <div><span class="card-title">CONSIDERAÇÕES (%)</span><br><small class="text-secondary" style="font-size: 0.7rem">(Clique para exportar)</small></div>
                      <button class="btn btn-sm btn-outline-light" @click="exportCSV(tables.cons, 'consideracoes')"><i class="fas fa-download"></i></button>
                    </div>
                    <div class="table-responsive">
                      <table class="table-tech table-clickable">
                        <thead><tr><th>Status</th><th class="text-end">Qtd</th><th class="text-end">%</th></tr></thead>
                        <tbody>
                          <tr v-for="r in tables.cons" :key="r.nome" @click="openModal('Consideração: ' + r.nome, filterBy('consideracoes', r.nome))">
                            <td>{{ r.nome }}</td><td class="text-end">{{ r.qtd }}</td><td class="text-end">{{ r.perc }}%</td>
                          </tr>
                        </tbody>
                        <tfoot><tr><td>TOTAL</td><td class="text-end">{{ filteredData.length }}</td><td></td></tr></tfoot>
                      </table>
                    </div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="tech-card">
                    <div class="card-header-tech">
                      <div><span class="card-title text-warning">DETALHAMENTO DE AVARIAS</span><br><small class="text-secondary" style="font-size: 0.7rem">(Clique para exportar)</small></div>
                      <button class="btn btn-sm btn-outline-light" @click="exportCSV(tables.probs, 'problemas')"><i class="fas fa-download"></i></button>
                    </div>
                    <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                      <table class="table-tech table-clickable">
                        <thead><tr><th>Problema</th><th class="text-end">Qtd</th><th class="text-end">Custo</th></tr></thead>
                        <tbody>
                          <tr v-for="r in tables.probs" :key="r.nome" @click="openModal('Problema: ' + r.nome, filterBy('problemaGeral', r.nome))">
                            <td>{{ r.nome }}</td><td class="text-end">{{ r.qtd }}</td><td class="text-end text-warning">{{ formatBRL(r.custo) }}</td>
                          </tr>
                        </tbody>
                        <tfoot><tr><td>TOTAL</td><td class="text-end">{{ kpi.divCount }}</td><td class="text-end text-warning">{{ formatBRL(kpi.custo) }}</td></tr></tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- QUARENTENA (Existente) -->
            <div v-if="view === 'quarentena'">
              <div class="row g-4 mb-4">
                <div class="col-md-4">
                  <div class="tech-card h-100 d-flex flex-column justify-content-center" style="border-color: var(--kabum-blue);">
                    <div class="text-center">
                      <div class="card-title mb-3" style="color: var(--kabum-blue)">TOTAL EM QUARENTENA</div>
                      <div class="kpi-big" style="font-size: 3.5rem;">{{ kpi.quarentenaCount }}</div>
                      <div class="kpi-sub">Máquinas no período</div>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="tech-card h-100 d-flex flex-column justify-content-center">
                    <div class="text-center">
                      <div class="card-title mb-3">% DO TOTAL</div>
                      <div class="kpi-big">{{ kpi.quarentenaPerc }}<small>%</small></div>
                      <div class="kpi-sub">Representatividade na produção</div>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="tech-card h-100 d-flex flex-column justify-content-center">
                    <div class="text-center">
                      <div class="card-title mb-3" style="color: var(--kabum-orange)">CUSTO QUARENTENA</div>
                      <div class="kpi-big" style="color: var(--kabum-orange)">{{ formatBRL(kpi.quarentenaCusto) }}</div>
                      <div class="kpi-sub">Peças trocadas em quarentena</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Gráfico e Tabela -->
              <div class="row g-4">
                <div class="col-12">
                  <div class="tech-card clickable-card">
                    <div class="card-header-tech">
                      <span class="card-title">QUARENTENA POR TÉCNICO</span>
                      <i class="fas fa-hand-pointer text-muted"></i>
                    </div>
                    <div id="chart-quarentena-tec"></div>
                    <div class="click-hint">Clique nas barras para relatório completo do técnico</div>
                  </div>
                </div>

                <div class="col-12">
                  <div class="tech-card">
                    <div class="card-header-tech">
                      <div><span class="card-title text-white">LISTA DE QUARENTENA</span></div>
                      <button class="btn btn-sm btn-outline-light" @click="exportCSV(tables.quarentenaList, 'lista_quarentena')"><i class="fas fa-download"></i> CSV</button>
                    </div>
                    <div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
                      <table class="table-tech">
                        <thead><tr><th>OS</th><th>Data</th><th>Técnico</th><th>Hora</th><th>Status</th><th class="text-end">Custo</th></tr></thead>
                        <tbody>
                          <tr v-for="r in tables.quarentenaList" :key="r.os">
                            <td class="fw-bold text-white">{{ r.os }}</td>
                            <td>{{ r.dataDisplay }}</td>
                            <td class="text-info">{{ r.tecnico }}</td>
                            <td>{{ r.hora }}</td>
                            <td><span class="badge-custom" style="color: var(--kabum-orange); border-color: var(--kabum-orange);">Quarentena</span></td>
                            <td class="text-end text-warning">{{ formatBRL(r.custo) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- MODAL GENÉRICO -->
      <div class="modal fade" id="mainModal" tabindex="-1">
        <div class="modal-dialog modal-xl modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title tech-font text-warning">{{ modalTitle }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div v-if="modalStats" class="row mb-4 g-3">
                <div class="col-md-3"><div class="modal-stat-card"><div class="modal-stat-label">Produção Total</div><div class="modal-stat-val">{{ modalStats.totalProd }}</div></div></div>
                <div class="col-md-3"><div class="modal-stat-card" style="border-color: var(--kabum-orange);"><div class="modal-stat-label" style="color: var(--kabum-orange);">Quarentena</div><div class="modal-stat-val" style="color: var(--kabum-orange);">{{ modalStats.totalQuar }}</div></div></div>
                <div class="col-md-3"><div class="modal-stat-card"><div class="modal-stat-label">% Representatividade</div><div class="modal-stat-val">{{ modalStats.perc }}%</div></div></div>
                <div class="col-md-3"><div class="modal-stat-card"><div class="modal-stat-label">Custo Gerado</div><div class="modal-stat-val text-warning">{{ formatBRL(modalStats.custo) }}</div></div></div>
                <div class="col-12 mt-3" v-if="modalStats.motivos && Object.keys(modalStats.motivos).length > 0">
                  <div class="tech-card p-3"><h6 class="text-secondary text-center mb-3">MOTIVOS / PROBLEMAS ENCONTRADOS</h6><div id="chart-modal-motivos"></div></div>
                </div>
              </div>

              <div class="d-flex justify-content-between mb-3">
                <div class="text-white">{{ modalRows.length }} Registros</div>
                <button class="btn btn-sm btn-warning tech-font" @click="exportCSV(modalRows, 'detalhes_export')">BAIXAR CSV</button>
              </div>
              <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                <table class="table-tech">
                  <thead><tr><th>OS</th><th>Data</th><th>Técnico</th><th>Status/Prob</th><th class="text-end">Custo</th></tr></thead>
                  <tbody>
                    <tr v-for="r in modalRows" :key="r.os">
                      <td class="fw-bold text-white">{{ r.os }}</td>
                      <td>{{ r.dataDisplay }} <small class="text-muted">{{ r.hora }}</small></td>
                      <td>{{ r.tecnico }}</td>
                      <td><span v-if="r.consideracoes === 'Quarentena'" class="text-warning">Quarentena</span><span v-else>{{ r.problemaGeral }}</span></td>
                      <td class="text-end">{{ formatBRL(r.custo) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js"></script>

    <script>
      const { createApp, ref, computed, onMounted, nextTick, watch } = Vue;

      createApp({
        setup() {
          const loading = ref(true);
          const loadProgress = ref(0);
          const loadingMessage = ref('Iniciando...');
          const showErrorBtn = ref(false);
          const rawData = ref([]); 
          const lastUpdate = ref('');
          const view = ref('geral');
          const filterStart = ref('');
          const filterEnd = ref('');
          const months = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'];
          const years = [2024, 2025, 2026];
          const currentMonthIdx = ref(new Date().getMonth());
          const selectedYear = ref(new Date().getFullYear());
          const showPeriodDropdown = ref(false);
          
          // Dossie State
          const searchOS = ref('');
          const dossieData = ref(null);
          const searchPerformed = ref(false);
          
          const modalTitle = ref('');
          const modalRows = ref([]);
          const modalStats = ref(null);
          let bsModal = null;

          // ATUALIZADO: MAPEAMENTO DAS COLUNAS NOVAS DO BACKEND
          const mapRow = (r) => ({
            os: r[0], 
            dataIso: r[1], 
            hora: r[2], 
            tecnico: r[3], 
            status: r[4], 
            problemaGeral: r[5], 
            avariaCustomiza: r[6], 
            ofensor: r[7], 
            custo: r[8], 
            consideracoes: r[9],
            
            // Novos campos (Indices 10+)
            recebidoPor: r[10],
            dataHoraRecebimento: r[11],
            dataHoraIniMont: r[12],
            dataHoraFimMont: r[13],
            duracaoMont: r[14],
            tecQualidade: r[15],
            dataHoraIniQual: r[16],
            dataHoraFimQual: r[17],
            duracaoQual: r[18],
            numNF: r[19],
            dataHoraNF: r[20],
            detalheDivergencia: r[21],

            dataDisplay: r[1] ? r[1].split('-').reverse().join('/') : '-',
            temDivergencia: r[4] === 'Com Divergência' || r[4] === 'Quarentena'
          });

          onMounted(() => {
            selectMonth(new Date().getMonth());
            fetchData(false);
          });

          const fetchData = (forceUpdate) => {
            loading.value = true;
            loadProgress.value = 10;
            showErrorBtn.value = false;
            loadingMessage.value = forceUpdate ? "Atualizando Cache Completo..." : "Buscando dados...";
            
            const runner = forceUpdate ? 'updateDataCache' : 'getCachedData';
            const tm = setTimeout(() => { if(loading.value) { loadingMessage.value = "Demorando..."; showErrorBtn.value = true; } }, 10000);

            if (typeof google === 'undefined') {
              setTimeout(() => { loading.value = false; }, 1000);
              return;
            }

            google.script.run
              .withSuccessHandler(res => {
                clearTimeout(tm);
                loadProgress.value = 100;
                if (res.error) { alert(res.error); loading.value = false; return; }
                
                const rows = res.data ? res.data : res;
                if (Array.isArray(rows)) {
                  rawData.value = rows.map(mapRow);
                  lastUpdate.value = res.generatedAt || 'N/A';
                  setTimeout(() => { loading.value = false; nextTick(initCharts); }, 500);
                } else {
                  alert("Formato inválido"); loading.value = false;
                }
              })
              .withFailureHandler(err => {
                clearTimeout(tm); alert("Erro: " + err.message); loading.value = false; showErrorBtn.value = true;
              })
              [runner](); 
          };

          const forceRefresh = () => fetchData(true);

          const selectMonth = (idx) => {
            currentMonthIdx.value = idx;
            showPeriodDropdown.value = false;
            const y = selectedYear.value;
            let start, end;
            if (idx === -1) { start = `${y}-01-01`; end = `${y}-12-31`; } 
            else {
              const lastDay = new Date(y, idx + 1, 0).getDate();
              const mStr = String(idx + 1).padStart(2, '0');
              start = `${y}-${mStr}-01`; end = `${y}-${mStr}-${lastDay}`;
            }
            filterStart.value = start; filterEnd.value = end;
          };

          const selectYear = (y) => { selectedYear.value = y; selectMonth(currentMonthIdx.value); };
          
          const closeDropdownOnClickOutside = () => { showPeriodDropdown.value = false; };
          const periodLabel = computed(() => currentMonthIdx.value === -1 ? `ANO COMPLETO / ${selectedYear.value}` : `${months[currentMonthIdx.value]} / ${selectedYear.value}`);

          const filteredData = computed(() => {
             if (!filterStart.value || !filterEnd.value) return rawData.value;
             return rawData.value.filter(r => r.dataIso && r.dataIso >= filterStart.value && r.dataIso <= filterEnd.value);
          });

          // Lógica de Busca do Dossiê
          const searchMachine = () => {
             searchPerformed.value = true;
             dossieData.value = null;
             if (!searchOS.value) return;
             
             // Busca na base completa, ignorando filtro de data
             const found = rawData.value.find(r => r.os.toUpperCase().includes(searchOS.value.toUpperCase()));
             if (found) {
                dossieData.value = found;
             }
          };
          
          const getBadgeClass = (status) => {
             if (status === 'Sucesso' || status === 'Ok') return 'bg-success';
             if (status === 'Quarentena') return 'bg-warning text-dark';
             return 'bg-danger';
          };

          const kpi = computed(() => {
            const d = filteredData.value;
            const total = d.length;
            const div = d.filter(x => x.temDivergencia);
            const custo = _.sumBy(div, 'custo');
            const taxa = total > 0 ? ((div.length / total) * 100).toFixed(2) : 0;
            const ofs = div.filter(x => x.ofensor && x.ofensor !== '-' && x.ofensor !== 'N/A');
            const grp = _.countBy(ofs, 'ofensor');
            let top = '-', topC = 0;
            if (Object.keys(grp).length) { top = Object.keys(grp).reduce((a, b) => grp[a] > grp[b] ? a : b); topC = grp[top]; }
            const quarList = d.filter(r => r.consideracoes === 'Quarentena');
            const qCount = quarList.length;
            const qPerc = total > 0 ? ((qCount/total)*100).toFixed(2) : 0;
            const qCusto = _.sumBy(quarList, 'custo');
            return { total, divCount: div.length, taxa, custo, ofensor: top, ofensorCount: topC, quarentenaCount: qCount, quarentenaPerc: qPerc, quarentenaCusto: qCusto };
          });

          const tables = computed(() => {
            const d = filteredData.value;
            const div = d.filter(x => x.temDivergencia);
            const consG = _.groupBy(d, 'consideracoes');
            const cons = Object.keys(consG).map(k => ({ nome: k, qtd: consG[k].length, perc: d.length ? ((consG[k].length/d.length)*100).toFixed(2) : 0 })).sort((a,b) => b.qtd - a.qtd);
            const probG = _.groupBy(div, 'problemaGeral');
            const probs = Object.keys(probG).map(k => { if (k==='-' || k==='N/A') return null; const items = probG[k]; return { nome: k, qtd: items.length, custo: _.sumBy(items, 'custo') }; }).filter(x=>x).sort((a,b) => b.custo - a.custo);
            const quarList = d.filter(r => r.consideracoes === 'Quarentena');
            return { cons, probs, quarentenaList: quarList, totalGeral: d.length };
          });

          const formatBRL = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
          const filterBy = (field, val) => filteredData.value.filter(x => x[field] === val);
          
          const openModal = (title, rows, stats = null) => {
            modalTitle.value = title; modalRows.value = rows; modalStats.value = stats; 
            if (!bsModal) bsModal = new bootstrap.Modal(document.getElementById('mainModal'));
            bsModal.show();
            if (stats && stats.motivos) {
               nextTick(() => {
                 const el = document.querySelector("#chart-modal-motivos");
                 if(el) {
                   el.innerHTML = '';
                   const series = Object.values(stats.motivos);
                   if (series.length > 0) {
                     new ApexCharts(el, { chart: { type: 'donut', height: 200, background: 'transparent' }, theme: { mode: 'dark', palette: 'palette1' }, series: series, labels: Object.keys(stats.motivos), colors: ['#FF6500', '#0060B1', '#00f2ff', '#8257e5', '#F7DF1E', '#E65C00', '#004B8D'], legend: { position: 'bottom', fontSize: '11px', labels: { colors: '#E0E0E0' }, itemMargin: { horizontal: 5, vertical: 0 } }, dataLabels: { style: { colors: ['#FFFFFF'] }, dropShadow: { enabled: true } } }).render();
                   } else { el.innerHTML = '<div class="text-center text-muted small">Sem dados de motivos</div>'; }
                 }
               });
            }
          };

          const openQuarentenaTecModal = (tecName) => {
             const allData = filteredData.value;
             const prodTotal = allData.filter(r => r.tecnico === tecName).length;
             const quarList = allData.filter(r => r.tecnico === tecName && r.consideracoes === 'Quarentena');
             const quarCount = quarList.length;
             const perc = prodTotal > 0 ? ((quarCount/prodTotal)*100).toFixed(2) : 0;
             const custo = _.sumBy(quarList, 'custo');
             const motivosObj = _.countBy(quarList, 'problemaGeral');
             delete motivosObj['-']; delete motivosObj['N/A'];
             const stats = { totalProd: prodTotal, totalQuar: quarCount, perc: perc, custo: custo, motivos: motivosObj };
             openModal(`Relatório Técnico: ${tecName}`, quarList, stats);
          };

          const exportCSV = (data, name) => {
            if (!data.length) return alert("Vazio");
            const headers = Object.keys(data[0]);
            let csv = "\uFEFF" + headers.join(";") + "\r\n";
            data.forEach(r => csv += headers.map(h => `"${String(r[h]||'').replace(/"/g,'""')}"`).join(";") + "\r\n");
            const link = document.createElement("a");
            link.href = encodeURI("data:text/csv;charset=utf-8," + csv);
            link.download = name + ".csv";
            document.body.click(link);
            link.click();
          };
          const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({behavior:'smooth'});
          const chartOpts = { chart: { background: 'transparent', toolbar: { show: false }, fontFamily: 'Poppins' }, theme: { mode: 'dark' }, dataLabels: { enabled: true }, grid: { borderColor: '#333' } };
          const initCharts = () => { bsModal = new bootstrap.Modal(document.getElementById('mainModal')); renderCharts(); }

          const renderCharts = () => {
            const data = filteredData.value;
            if (view.value === 'geral') {
              const tG = _.groupBy(data, 'tecnico');
              // Ordenar por quantidade decrescente para visualização melhor
              const tCatsRaw = Object.keys(tG).sort((a, b) => tG[b].length - tG[a].length);

              // Lógica para encurtar nomes (1º e 2º nome apenas)
              const tCatsDisplay = tCatsRaw.map(n => {
                  if (!n) return "N/A";
                  const p = n.toString().trim().split(' ');
                  // Se tiver mais que 2 nomes, pega os 2 primeiros. Se não, pega o que tiver.
                  return p.length > 1 ? `${p[0]} ${p[1]}` : p[0];
              });

              const tVal = tCatsRaw.map(v => tG[v].length);

              const elT = document.querySelector("#chart-tecnicos");
              if (elT) { 
                elT.innerHTML=''; 
                new ApexCharts(elT, { 
                  ...chartOpts, 
                  series: [{name:'OS', data:tVal}], 
                  chart:{
                    type:'bar', 
                    height:350, // Altura aumentada
                    events:{
                      dataPointSelection:(e,c,cfg)=>openModal('Tec: '+tCatsRaw[cfg.dataPointIndex], tG[tCatsRaw[cfg.dataPointIndex]])
                    }
                  }, 
                  colors:['#0060B1'], 
                  plotOptions:{
                    bar:{
                      distributed:true, 
                      borderRadius:4,
                      dataLabels: { position: 'top' } // Números em cima da barra
                    }
                  }, 
                  dataLabels: {
                    enabled: true,
                    offsetY: -20,
                    style: { fontSize: '12px', colors: ["#fff"] }
                  },
                  xaxis:{
                    categories: tCatsDisplay, // Usa nomes encurtados
                    labels:{
                      style:{colors:'#fff', fontSize: '11px'},
                      rotate: -45, // Rotação para caber
                      trim: false,
                      hideOverlappingLabels: false // Força mostrar todos
                    }
                  }, 
                  legend:{show:false} 
                }).render(); 
              }

              const hG = _.groupBy(data, 'hora');
              const hCats = Object.keys(hG).filter(k=>!['N/A','-'].includes(k)).sort((a,b)=>parseInt(a)-parseInt(b));
              const hVal = hCats.map(k => hG[k].length);
              const elH = document.querySelector("#chart-horas");
              if (elH) { elH.innerHTML=''; new ApexCharts(elH, { ...chartOpts, series: [{name:'OS', data:hVal}], chart:{type:'bar', height:300, events:{dataPointSelection:(e,c,cfg)=>openModal('Hora: '+hCats[cfg.dataPointIndex], hG[hCats[cfg.dataPointIndex]])}}, colors:['#FF6500'], xaxis:{categories:hCats, labels:{style:{colors:'#aaa'}}} }).render(); }

              const dG = _.groupBy(data, 'dataIso');
              const dCats = Object.keys(dG).sort();
              const dVal = dCats.map(k => dG[k].length);
              const dLbl = dCats.map(d => d.split('-').reverse().join('/'));
              const elL = document.querySelector("#chart-timeline");
              if (elL) { elL.innerHTML=''; new ApexCharts(elL, { ...chartOpts, series: [{name:'OS', data:dVal}], chart:{type:'area', height:250}, colors:['#00f2ff'], xaxis:{categories:dLbl, labels:{style:{colors:'#aaa'}}} }).render(); }
            }
            if (view.value === 'financeiro') {
              const div = data.filter(x => x.temDivergencia);
              const pG = _.groupBy(div, 'problemaGeral');
              const pCats = Object.keys(pG).filter(k=>!['N/A','-'].includes(k));
              const pVal = pCats.map(k => _.sumBy(pG[k], 'custo'));
              const elC = document.querySelector("#chart-custos");
              if (elC) { elC.innerHTML=''; new ApexCharts(elC, { ...chartOpts, series: [{name:'Custo', data:pVal}], chart:{type:'bar', height:320}, colors:['#FF6500'], plotOptions:{bar:{horizontal:true, borderRadius:4}}, xaxis:{categories:pCats, labels:{style:{colors:'#fff'}}}, dataLabels:{formatter:(v)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v)} }).render(); }
            }
            if (view.value === 'quarentena') {
               const quar = data.filter(r => r.consideracoes === 'Quarentena');
               const qG = _.groupBy(quar, 'tecnico');
               const qCats = Object.keys(qG);
               const qVal = Object.values(qG).map(v => v.length);
               const elQ = document.querySelector("#chart-quarentena-tec");
               if (elQ) {
                 elQ.innerHTML = '';
                 new ApexCharts(elQ, { ...chartOpts, series: [{name:'Quarentena', data:qVal}], chart: { type: 'bar', height: 300, events: { dataPointSelection: (e, c, cfg) => { const tecName = qCats[cfg.dataPointIndex]; openQuarentenaTecModal(tecName); } } }, colors: ['#0060B1'], plotOptions: { bar: { borderRadius: 4, distributed: true } }, xaxis: { categories: qCats, labels: { style: { colors: '#fff' } } }, legend: { show: false } }).render();
               }
            }
          };

          watch([view, filteredData], () => nextTick(renderCharts));

          return { loading, loadProgress, loadingMessage, showErrorBtn, rawData, lastUpdate, filteredData, kpi, tables, view, filterStart, filterEnd, months, years, currentMonthIdx, selectedYear, selectMonth, selectYear, fetchData, forceRefresh, formatBRL, scrollTo, exportCSV, openModal, modalTitle, modalRows, modalStats, showPeriodDropdown, periodLabel, closeDropdownOnClickOutside, searchOS, searchMachine, dossieData, searchPerformed, getBadgeClass };
        }
      }).mount('#app');
    </script>
  </body>
</html>
