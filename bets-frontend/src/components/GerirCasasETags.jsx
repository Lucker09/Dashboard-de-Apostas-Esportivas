import React, { useState, useEffect } from 'react';
import { casasService } from '../services/casasService';
import { tagsService } from '../services/tagsService';
import { Plus, Trash2, Building2, Tag as TagIcon } from 'lucide-react';

export default function GerirCasasETags() {
    const [casas, setCasas] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);

    const [nomeCasa, setNomeCasa] = useState('');
    const [corCasa, setCorCasa] = useState('#3b82f6');

    const [nomeTag, setNomeTag] = useState('');
    const [corTag, setCorTag] = useState('#10b981');

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            setLoading(true);
            const [resCasas, resTags] = await Promise.all([
                casasService.listar(),
                tagsService.listar()
            ]);
            setCasas(resCasas);
            setTags(resTags);
        } catch (error) {
            console.error('Erro ao carregar casas e tags:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCriarCasa = async (e) => {
        e.preventDefault();
        if (!nomeCasa.trim()) return;
        try {
            await casasService.criar({ nome: nomeCasa, cor: corCasa });
            setNomeCasa('');
            setCorCasa('#3b82f6');
            carregarDados();
        } catch (error) {
            console.error('Erro ao criar casa:', error);
        }
    };

    const handleDeletarCasa = async (id, nome) => {
        const nomeLower = nome.toLowerCase();
        if (nomeLower === 'bet365' || nomeLower === 'betano' || nomeLower === 'superbet') {
            alert('Não é permitido apagar as casas de aposta padrão.');
            return;
        }

        if (!confirm('Tem certeza que deseja apagar esta casa de aposta?')) return;
        try {
            await casasService.apagar(id);
            carregarDados();
        } catch (error) {
            console.error('Erro ao apagar casa:', error);
            alert(error.response?.data?.message || 'Erro ao apagar casa de aposta.');
        }
    };

    const handleCriarTag = async (e) => {
        e.preventDefault();
        if (!nomeTag.trim()) return;
        try {
            await tagsService.criar({ nome: nomeTag, cor: corTag });
            setNomeTag('');
            setCorTag('#10b981');
            carregarDados();
        } catch (error) {
            console.error('Erro ao criar tag:', error);
        }
    };

    const handleDeletarTag = async (id) => {
        if (!confirm('Tem certeza que deseja apagar esta tag?')) return;
        try {
            await tagsService.apagar(id);
            carregarDados();
        } catch (error) {
            console.error('Erro ao apagar tag:', error);
        }
    };

    const isCasaPadrao = (nome) => {
        const n = nome.toLowerCase();
        return n === 'bet365' || n === 'betano' || n === 'superbet';
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Gerir Casas de Aposta e Tags</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Configure as suas casas de aposta favoritas e etiquetas personalizadas.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* CASAS DE APOSTA */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
                    <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
                        <Building2 className="text-blue-600 dark:text-blue-400" size={20} />
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Casas de Aposta</h2>
                    </div>

                    <form onSubmit={handleCriarCasa} className="flex gap-2 items-end">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Nome da Casa</label>
                            <input
                                type="text"
                                required
                                value={nomeCasa}
                                onChange={(e) => setNomeCasa(e.target.value)}
                                placeholder="Ex: Outra Casa..."
                                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Cor</label>
                            <input
                                type="color"
                                value={corCasa}
                                onChange={(e) => setCorCasa(e.target.value)}
                                className="w-10 h-9 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer p-1 bg-white dark:bg-gray-900"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 h-[38px]"
                        >
                            <Plus size={16} /> Adicionar
                        </button>
                    </form>

                    <div className="space-y-3 divide-y divide-gray-100 dark:divide-gray-700">
                        {loading ? (
                            <p className="text-sm text-gray-400 text-center py-4">A carregar...</p>
                        ) : (
                            casas.map(casa => {
                                const padrao = isCasaPadrao(casa.nome);
                                return (
                                    <div key={casa.id} className="pt-3 first:pt-0 flex justify-between items-center">
                                        <div className="flex items-center gap-2.5">
                                            <span className="w-4 h-4 rounded-full shadow-xs" style={{ backgroundColor: casa.cor || '#3b82f6' }}></span>
                                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{casa.nome}</span>
                                            {padrao && (
                                                <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">Padrão</span>
                                            )}
                                        </div>
                                        {!padrao && (
                                            <button
                                                onClick={() => handleDeletarCasa(casa.id, casa.nome)}
                                                className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition p-1"
                                                title="Apagar Casa"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        )}
                        {casas.length === 0 && !loading && (
                            <p className="text-sm text-gray-400 italic text-center py-4">Nenhuma casa registada.</p>
                        )}
                    </div>
                </div>

                {/* TAGS PERSONALIZADAS */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
                    <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
                        <TagIcon className="text-emerald-600 dark:text-emerald-400" size={20} />
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Tags Personalizadas</h2>
                    </div>

                    <form onSubmit={handleCriarTag} className="flex gap-2 items-end">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Nome da Tag</label>
                            <input
                                type="text"
                                required
                                value={nomeTag}
                                onChange={(e) => setNomeTag(e.target.value)}
                                placeholder="Ex: Dupla, Ao Vivo..."
                                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Cor</label>
                            <input
                                type="color"
                                value={corTag}
                                onChange={(e) => setCorTag(e.target.value)}
                                className="w-10 h-9 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer p-1 bg-white dark:bg-gray-900"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 h-[38px]"
                        >
                            <Plus size={16} /> Adicionar
                        </button>
                    </form>

                    <div className="space-y-3 divide-y divide-gray-100 dark:divide-gray-700">
                        {loading ? (
                            <p className="text-sm text-gray-400 text-center py-4">A carregar...</p>
                        ) : (
                            tags.map(tag => (
                                <div key={tag.id} className="pt-3 first:pt-0 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-1 rounded-md text-xs font-medium text-white shadow-xs" style={{ backgroundColor: tag.cor || '#10b981' }}>
                                            {tag.nome}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleDeletarTag(tag.id)}
                                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition p-1"
                                        title="Apagar Tag"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                        {tags.length === 0 && !loading && (
                            <p className="text-sm text-gray-400 italic text-center py-4">Nenhuma tag registada.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}