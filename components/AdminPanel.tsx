import React, { useState, useEffect } from 'react';
import { generateCodes, getStoredCodes } from '../services/storageService';
import { ActivationCode } from '../types';
import { X, RefreshCw, Copy, Check, ShieldCheck, ShieldAlert, Download } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const AdminPanel: React.FC<Props> = ({ onClose }) => {
  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setCodes(getStoredCodes());
  }, []);

  const handleGenerate = () => {
    const newCodes = generateCodes(5);
    setCodes(prev => [...newCodes, ...prev]);
  };

  const handleDownload = () => {
    const dataStr = JSON.stringify(codes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qiankun_codes_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const activeCount = codes.filter(c => !c.isUsed).length;

  return (
    <div className="fixed inset-0 z-50 bg-[#2C1810] bg-opacity-95 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-[#FDFBF7]">
          <div>
            <h2 className="text-xl font-bold text-[#2C1810] flex items-center gap-2">
              天机阁后台管理 (Admin)
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              有效令牌: <span className="font-bold text-[#1D8348]">{activeCount}</span> / 总数: {codes.length}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-[#2C1810]">
            <X />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-end items-center gap-3">
           <button 
             onClick={handleDownload}
             className="bg-white border border-[#D7CCC8] text-[#5D4037] px-4 py-2 rounded flex items-center gap-2 hover:bg-[#F2F0E9] transition-colors shadow-sm text-sm font-bold"
           >
             <Download size={16} />
             下载记录 (JSON)
           </button>
           <button 
             onClick={handleGenerate}
             className="bg-[#2C1810] text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-[#43291F] transition-colors shadow-md text-sm font-bold"
           >
             <RefreshCw size={16} />
             生成5个新令牌
           </button>
        </div>

        {/* List */}
        <div className="overflow-auto flex-1 p-0">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-xs uppercase text-gray-500 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4 bg-gray-100">令牌 (Code)</th>
                <th className="p-4 bg-gray-100">状态 (Status)</th>
                <th className="p-4 bg-gray-100">生成时间</th>
                <th className="p-4 bg-gray-100 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {codes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">暂无令牌，请生成</td>
                </tr>
              ) : (
                codes.map((c) => (
                  <tr key={c.code} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-[#2C1810] tracking-wider">{c.code}</td>
                    <td className="p-4">
                      {c.isUsed ? (
                        <div className="flex items-center gap-1 text-red-600 bg-red-50 w-fit px-2 py-1 rounded-full text-xs">
                           <ShieldAlert size={12} />
                           <span>已失效</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-green-700 bg-green-50 w-fit px-2 py-1 rounded-full text-xs">
                           <ShieldCheck size={12} />
                           <span>有效</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-gray-500 text-xs">
                      {new Date(c.generatedAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => copyToClipboard(c.code)}
                        className={`p-2 rounded hover:bg-gray-200 transition-colors ${copied === c.code ? 'text-green-600' : 'text-gray-400'}`}
                        title="Copy"
                      >
                        {copied === c.code ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
