"use client";
import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Registro {
  nome: string;
  data: string;
  entrada: string;
  saida: string;
}

export default function FolhaDePonto() {
  // Estado para todos os registros salvos
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [formData, setFormData] = useState({ nome: '', data: '', entrada: '', saida: '' });
  const [filtroData, setFiltroData] = useState(new Date().toISOString().split('T')[0]);

  // 1. CARREGAR DADOS: Executa uma vez quando abre a página
  useEffect(() => {
    const dadosSalvos = localStorage.getItem('registros_ponto_arte');
    if (dadosSalvos) {
      setRegistros(JSON.parse(dadosSalvos));
    }
  }, []);

  // 2. SALVAR DADOS: Sempre que a lista de registros mudar, salva no navegador
  useEffect(() => {
    localStorage.setItem('registros_ponto_arte', JSON.stringify(registros));
  }, [registros]);

  const adicionarRegistro = (e: React.FormEvent) => {
    e.preventDefault();
    setRegistros([...registros, formData]);
    setFormData({ ...formData, entrada: '', saida: '' });
    alert("Ponto registrado com sucesso!");
  };

  // Filtra os registros para exibir na tabela apenas o dia selecionado
  const registrosFiltrados = registros.filter(reg => reg.data === filtroData);

  const gerarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(40, 167, 69);
    doc.text('Arte Mãos e Flores', 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Relatório de Frequência - Dia: ${filtroData}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [['Colaborador', 'Data', 'Entrada', 'Saída']],
      body: registrosFiltrados.map(r => [r.nome, r.data, r.entrada, r.saida]),
      headStyles: { fillColor: [40, 167, 69] },
    });

    doc.save(`ponto-${filtroData}.pdf`);
  };

  return (
    <div className="container py-5">
      <div className="card shadow mb-4">
        <div className="card-header bg-success text-white">
          <h2 className="mb-0">Arte Mãos e Flores</h2>
          <small>Registro de Ponto Digital</small>
        </div>
        
        <div className="card-body">
          <h5 className="card-title text-success mb-3">Novo Registro</h5>
          <form onSubmit={adicionarRegistro} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nome do Colaborador</label>
              <input type="text" className="form-control" value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})} required />
            </div>
            <div className="col-md-2">
              <label className="form-label">Data</label>
              <input type="date" className="form-control" value={formData.data}
                onChange={(e) => setFormData({...formData, data: e.target.value})} required />
            </div>
            <div className="col-md-2">
              <label className="form-label">Entrada</label>
              <input type="time" className="form-control" value={formData.entrada}
                onChange={(e) => setFormData({...formData, entrada: e.target.value})} required />
            </div>
            <div className="col-md-2">
              <label className="form-label">Saída</label>
              <input type="time" className="form-control" value={formData.saida}
                onChange={(e) => setFormData({...formData, saida: e.target.value})} required />
            </div>
            <div className="col-12 text-end">
              <button type="submit" className="btn btn-success px-4">Salvar Ponto</button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0 text-secondary">Histórico de Registros</h5>
          <div className="d-flex align-items-center">
            <span className="me-2 text-muted">Filtrar por dia:</span>
            <input type="date" className="form-control form-control-sm" 
              value={filtroData} onChange={(e) => setFiltroData(e.target.value)} />
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover border">
              <thead className="table-light">
                <tr>
                  <th>Colaborador</th>
                  <th>Data</th>
                  <th>Entrada</th>
                  <th>Saída</th>
                </tr>
              </thead>
              <tbody>
                {registrosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-4">
                      Nenhum registro encontrado para o dia {filtroData}.
                    </td>
                  </tr>
                ) : (
                  registrosFiltrados.map((reg, index) => (
                    <tr key={index}>
                      <td>{reg.nome}</td>
                      <td>{reg.data}</td>
                      <td>{reg.entrada}</td>
                      <td>{reg.saida}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {registrosFiltrados.length > 0 && (
            <button onClick={gerarPDF} className="btn btn-primary mt-3">
              Imprimir PDF deste Dia
            </button>
          )}
        </div>
      </div>
    </div>
  );
}