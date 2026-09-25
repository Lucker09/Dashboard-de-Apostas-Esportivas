import { useCallback, useEffect, useState, useRef } from 'react';
import { betsService } from '../services/betsService';
import { casasService } from '../services/casasService';
import { tagsService } from '../services/tagsService';
import { formatMoney } from '../utils/format';
import { Plus, Check, Search, Tag as TagIcon } from 'lucide-react';

const EMPTY_BET = {
    descricao: '',
    odd: '',
    valorApostado: '',
    casaDeApostaId: '',
    tagIds: [],
};

export default function BetsTable() {
    const [bets, setBets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cashoutBet, setCashoutBet] = useState(null);
    const [cashoutValue, setCashoutValue] = useState('');
    const [newBet, setNewBet] = useState(EMPTY_BET);

    // Gestão de Tags e Casa em Aposta Existente
    const [editingTagsBet, setEditingTagsBet] = useState(null);
    const [selectedTagIdsForEdit, setSelectedTagIdsForEdit] = useState([]);

    // Filtros e Pesquisa
    const [searchTerm, setSearchTerm] = useState('');

    // Popover de Tags Excedentes (+X)
    const [activePopover, setActivePopover] = useState(null);
    const popoverRef = useRef(null);

    // Estados para Casas de Aposta e Tags no Modal
    const [casas, setCasas] = useState([]);
    const [tagsDisponiveis, setTagsDisponiveis] = useState([]);
    const [mostrarCriarTag, setMostrarCriarTag] = useState(false);
    const [novoNomeTag, setNovoNomeTag] = useState('');
    const [novaCorTag, setNovaCorTag] = useState('#10b981');

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setActivePopover(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getErrorMessage = (err, fallback) => {
        if (err.response?.data?.message) return err.response.data.message;
        if (err.response?.data?.errors) return Object.values(err.response.data.errors).join(', ');
        return fallback;
    };

    const loadBets = useCallback(async (pageNumber) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            setLoading(true);
            setError('');
            const data = await betsService.getAllBets(pageNumber, 10);
            setBets(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            setError(getErrorMessage(err, 'Não foi possível carregar as apostas.'));
        } finally {
            setLoading(false);
        }
    }, []);

    const carregarCasasETags = async () => {
        try {
            const [resCasas, resTags] = await Promise.all([
                casasService.listar(),
                tagsService.listar()
            ]);
            setCasas(resCasas);
            setTagsDisponiveis(resTags);
            if (resCasas.length > 0 && !newBet.casaDeApostaId) {
                setNewBet(prev => ({ ...prev, casaDeApostaId: resCasas[0].id }));
            }
        } catch (err) {
            console.error('Erro ao carregar casas e tags:', err);
        }
    };

    useEffect(() => {
        loadBets(page);
    }, [page, loadBets]);

    useEffect(() => {
        if (isModalOpen || editingTagsBet) {
            carregarCasasETags();
        }
    }, [isModalOpen, editingTagsBet]);

    const handleCriarTagInline = async (e) => {
        e.preventDefault();
        if (!novoNomeTag.trim()) return;
        try {
            const novaTag = await tagsService.criar({ nome: novoNomeTag, cor: novaCorTag });
            setTagsDisponiveis([...tagsDisponiveis, novaTag]);
            setNewBet(prev => ({
                ...prev,
                tagIds: [...prev.tagIds, novaTag.id]
            }));
            setNovoNomeTag('');
            setMostrarCriarTag(false);
        } catch (err) {
            console.error('Erro ao criar tag inline:', err);
        }
    };

    const toggleTagSelection = (tagId) => {
        setNewBet(prev => {
            const exists = prev.tagIds.includes(tagId);
            return {
                ...prev,
                tagIds: exists
                    ? prev.tagIds.filter(id => id !== tagId)
                    : [...prev.tagIds, tagId]
            };
        });
    };

    const toggleEditTagSelection = (tagId) => {
        setSelectedTagIdsForEdit(prev => {
            const exists = prev.includes(tagId);
            return exists ? prev.filter(id => id !== tagId) : [...prev, tagId];
        });
    };

    const handleCreateBet = async (e) => {
        e.preventDefault();
        if (!newBet.casaDeApostaId) {
            setError('A Casa de Aposta é obrigatória.');
            return;
        }

        try {
            setSaving(true);
            setError('');
            await betsService.createBet({
                descricao: newBet.descricao.trim(),
                odd: Number(newBet.odd),
                valorApostado: Number(newBet.valorApostado),
                casaDeApostaId: Number(newBet.casaDeApostaId),
                tagIds: newBet.tagIds || [],
            });

            window.dispatchEvent(new CustomEvent('atualizar-saldo'));
            setIsModalOpen(false);
            setNewBet(EMPTY_BET);
            setPage(0);
            await loadBets(0);
        } catch (err) {
            setError(getErrorMessage(err, 'Não foi possível criar a aposta.'));
        } finally {
            setSaving(false);
        }
    };

    const handleSaveTagsForBet = async (e) => {
        e.preventDefault();
        if (!editingTagsBet) return;

        const casaId = editingTagsBet.casaDeAposta?.id || editingTagsBet.casaDeApostaId;
        if (!casaId) {
            setError('A Casa de Aposta é obrigatória.');
            return;
        }

        try {
            setSaving(true);
            setError('');
            await betsService.updateBet(editingTagsBet.id, {
                descricao: editingTagsBet.descricao,
                odd: Number(editingTagsBet.odd),
                valorApostado: Number(editingTagsBet.valorApostado),
                casaDeApostaId: Number(casaId),
                tagIds: selectedTagIdsForEdit
            });

            setEditingTagsBet(null);
            setSelectedTagIdsForEdit([]);
            await loadBets(page);
        } catch (err) {
            setError(getErrorMessage(err, 'Não foi possível atualizar a aposta.'));
        } finally {
            setSaving(false);
        }
    };

    const handleLiquidate = async (id, status, valorResgatado = null) => {
        try {
            setSaving(true);
            setError('');
            await betsService.liquidateBet(id, status, valorResgatado);
            window.dispatchEvent(new CustomEvent('atualizar-saldo'));
            setCashoutBet(null);
            setCashoutValue('');
            await loadBets(page);
        } catch (err) {
            setError(getErrorMessage(err, 'Não foi possível liquidar a aposta.'));
        } finally {
            setSaving(false);
        }
    };

    const handleCashoutSubmit = (e) => {
        e.preventDefault();
        if (!cashoutBet || cashoutValue === '') return;
        handleLiquidate(cashoutBet.id, 'CASHOUT', cashoutValue);
    };

    const getStatusBadge = (status) => {
        const badges = {
            GREEN: ['Green', 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-950/60'],
            RED: ['Red', 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-950/60'],
            CASHOUT: ['Cash-out', 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60'],
            ANULADA: ['Anulada', 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800'],
            PENDENTE: ['Pendente', 'text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-950/60'],
        };
        const [label, classes] = badges[status] || badges.PENDENTE;
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${classes}`}>{label}</span>;
    };

    const filteredBets = bets.filter(bet =>
        bet.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Minhas Apostas</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Gestão e registo de apostas com casas e tags.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Pesquisar descrição..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition whitespace-nowrap"
                    >
                        + Nova Aposta
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 p-3 text-sm text-red-700 dark:text-red-300">
                    {error}
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                            <th className="p-4">Data</th>
                            <th className="p-4">Descrição</th>
                            <th className="p-4">Casa / Tags</th>
                            <th className="p-4">Odd</th>
                            <th className="p-4">Valor (R$)</th>
                            <th className="p-4">Retorno</th>
                            <th className="p-4">P&L</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Ações</th>
                        </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm text-gray-700 dark:text-gray-300">
                        {loading ? (
                            <tr>
                                <td colSpan="9" className="p-6 text-center text-gray-400">A carregar apostas...</td>
                            </tr>
                        ) : filteredBets.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="p-6 text-center text-gray-400">Nenhuma aposta encontrada.</td>
                            </tr>
                        ) : (
                            filteredBets.map((bet) => {
                                const tags = bet.tags || [];
                                const maxVisibleTags = 1;
                                const visibleTags = tags.slice(0, maxVisibleTags);
                                const hiddenTagsCount = tags.length - maxVisibleTags;

                                return (
                                    <tr key={bet.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition">
                                        <td className="p-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {bet.dataCriacao ? new Date(bet.dataCriacao).toLocaleDateString('pt-BR') : 'N/A'}
                                        </td>
                                        <td className="p-4 font-medium text-gray-800 dark:text-gray-200">
                                            {bet.descricao}
                                        </td>
                                        <td className="p-4 space-y-1.5">
                                            {bet.casaDeAposta && (
                                                <span
                                                    className="inline-block px-2 py-0.5 text-xs font-semibold rounded text-white shadow-xs"
                                                    style={{ backgroundColor: bet.casaDeAposta.cor || '#3b82f6' }}
                                                >
                                                    {bet.casaDeAposta.nome}
                                                </span>
                                            )}

                                            <div className="flex flex-wrap gap-1 items-center relative">
                                                {visibleTags.map(tag => (
                                                    <span
                                                        key={tag.id}
                                                        className="px-2 py-0.5 rounded text-[10px] font-medium text-white"
                                                        style={{ backgroundColor: tag.cor || '#10b981' }}
                                                    >
                                                        {tag.nome}
                                                    </span>
                                                ))}

                                                {hiddenTagsCount > 0 && (
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setActivePopover(activePopover === bet.id ? null : bet.id)}
                                                            className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 transition"
                                                        >
                                                            +{hiddenTagsCount}
                                                        </button>

                                                        {activePopover === bet.id && (
                                                            <div ref={popoverRef} className="absolute left-0 top-6 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg p-2 flex flex-col gap-1 min-w-[120px]">
                                                                <span className="text-[10px] font-semibold text-gray-400 px-1 border-b border-gray-100 dark:border-gray-800 pb-0.5">Tags</span>
                                                                {tags.map(tag => (
                                                                    <span
                                                                        key={tag.id}
                                                                        className="px-2 py-1 rounded text-xs font-medium text-white text-center"
                                                                        style={{ backgroundColor: tag.cor || '#10b981' }}
                                                                    >
                                                                        {tag.nome}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => {
                                                        setEditingTagsBet(bet);
                                                        setSelectedTagIdsForEdit(tags.map(t => t.id));
                                                    }}
                                                    className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition ml-1"
                                                    title="Gerir Tags e Casa desta aposta"
                                                >
                                                    <TagIcon size={14} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-4 font-semibold">{Number(bet.odd).toFixed(2)}</td>
                                        <td className="p-4">{formatMoney(bet.valorApostado)}</td>
                                        <td className="p-4">{bet.status === 'PENDENTE' ? '—' : formatMoney(bet.valorResgatado)}</td>
                                        <td className={`p-4 font-medium ${
                                            Number(bet.profitAndLoss) > 0 ? 'text-green-600 dark:text-green-400' :
                                                Number(bet.profitAndLoss) < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500'
                                        }`}>
                                            {bet.status === 'PENDENTE' ? '—' : formatMoney(bet.profitAndLoss)}
                                        </td>
                                        <td className="p-4">{getStatusBadge(bet.status)}</td>
                                        <td className="p-4 text-center">
                                            {bet.status === 'PENDENTE' ? (
                                                <div className="flex justify-center gap-1 flex-wrap">
                                                    <button
                                                        disabled={saving}
                                                        onClick={() => handleLiquidate(bet.id, 'GREEN')}
                                                        className="bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 px-2 py-1 rounded text-xs font-medium"
                                                    >
                                                        Green
                                                    </button>
                                                    <button
                                                        disabled={saving}
                                                        onClick={() => handleLiquidate(bet.id, 'RED')}
                                                        className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 px-2 py-1 rounded text-xs font-medium"
                                                    >
                                                        Red
                                                    </button>
                                                    <button
                                                        disabled={saving}
                                                        onClick={() => { setCashoutBet(bet); setCashoutValue(''); }}
                                                        className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs font-medium"
                                                    >
                                                        Cash-out
                                                    </button>
                                                    <button
                                                        disabled={saving}
                                                        onClick={() => handleLiquidate(bet.id, 'ANULADA')}
                                                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs font-medium"
                                                    >
                                                        Anulada
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Liquidada</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                    <span>Página {page + 1} de {totalPages || 1}</span>
                    <div className="space-x-2">
                        <button
                            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                            disabled={page === 0 || loading}
                            className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-700 disabled:opacity-50"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => setPage((prev) => prev + 1)}
                            disabled={page + 1 >= totalPages || loading}
                            className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-700 disabled:opacity-50"
                        >
                            Próxima
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL DE EDITAR APOSTA (CASA E TAGS) */}
            {editingTagsBet && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full p-6 space-y-4 border border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Editar Aposta</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {editingTagsBet.descricao}
                        </p>

                        <form onSubmit={handleSaveTagsForBet} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Casa de Aposta *</label>
                                <select
                                    required
                                    value={editingTagsBet.casaDeAposta?.id || editingTagsBet.casaDeApostaId || ''}
                                    onChange={(e) => setEditingTagsBet({
                                        ...editingTagsBet,
                                        casaDeApostaId: Number(e.target.value),
                                        casaDeAposta: { ...editingTagsBet.casaDeAposta, id: Number(e.target.value) }
                                    })}
                                    className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg p-2.5 text-sm outline-none"
                                >
                                    <option value="" disabled>Selecione uma casa...</option>
                                    {casas.map((casa) => (
                                        <option key={casa.id} value={casa.id}>{casa.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Tags</label>
                                <div className="flex flex-wrap gap-2 pt-2 max-h-48 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                                    {tagsDisponiveis.map((tag) => {
                                        const selecionada = selectedTagIdsForEdit.includes(tag.id);
                                        return (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                onClick={() => toggleEditTagSelection(tag.id)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition border ${
                                                    selecionada ? 'text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                                                }`}
                                                style={selecionada ? { backgroundColor: tag.cor || '#3b82f6', borderColor: tag.cor || '#3b82f6' } : {}}
                                            >
                                                {selecionada && <Check size={12} />}
                                                {tag.nome}
                                            </button>
                                        );
                                    })}
                                    {tagsDisponiveis.length === 0 && (
                                        <p className="text-xs text-gray-400 italic">Nenhuma tag registada.</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setEditingTagsBet(null)}
                                    className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {saving ? 'A guardar...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE CRIAR APOSTA */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-lg w-full p-6 space-y-4 border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Criar Nova Aposta</h2>
                        <form onSubmit={handleCreateBet} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Descrição</label>
                                <input
                                    type="text"
                                    required
                                    value={newBet.descricao}
                                    onChange={(e) => setNewBet({ ...newBet, descricao: e.target.value })}
                                    className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg p-2.5 text-sm outline-none"
                                    placeholder="Ex: Real Madrid vs Barcelona"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Odd</label>
                                    <input
                                        type="number" step="0.01" min="1.01" required
                                        value={newBet.odd}
                                        onChange={(e) => setNewBet({ ...newBet, odd: e.target.value })}
                                        className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg p-2.5 text-sm outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Valor (R$)</label>
                                    <input
                                        type="number" step="0.01" min="0.01" required
                                        value={newBet.valorApostado}
                                        onChange={(e) => setNewBet({ ...newBet, valorApostado: e.target.value })}
                                        className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg p-2.5 text-sm outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Casa de Aposta *</label>
                                <select
                                    required
                                    value={newBet.casaDeApostaId}
                                    onChange={(e) => setNewBet({ ...newBet, casaDeApostaId: e.target.value })}
                                    className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg p-2.5 text-sm outline-none"
                                >
                                    <option value="" disabled>Selecione uma casa...</option>
                                    {casas.map((casa) => (
                                        <option key={casa.id} value={casa.id}>{casa.nome}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Tags</label>
                                    <button
                                        type="button"
                                        onClick={() => setMostrarCriarTag(!mostrarCriarTag)}
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                                    >
                                        <Plus size={14} /> Nova Tag
                                    </button>
                                </div>
                                {mostrarCriarTag && (
                                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 mb-3 flex gap-2 items-end">
                                        <input
                                            type="text"
                                            value={novoNomeTag}
                                            onChange={(e) => setNovoNomeTag(e.target.value)}
                                            placeholder="Nome da tag..."
                                            className="w-full text-xs border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        />
                                        <input
                                            type="color"
                                            value={novaCorTag}
                                            onChange={(e) => setNovaCorTag(e.target.value)}
                                            className="w-8 h-8 border border-gray-200 dark:border-gray-700 rounded cursor-pointer p-0.5 bg-white dark:bg-gray-800"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleCriarTagInline}
                                            className="bg-emerald-600 text-white px-3 py-1.5 text-xs rounded hover:bg-emerald-700 font-medium"
                                        >
                                            Criar
                                        </button>
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {tagsDisponiveis.map((tag) => {
                                        const selecionada = newBet.tagIds.includes(tag.id);
                                        return (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                onClick={() => toggleTagSelection(tag.id)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition border ${
                                                    selecionada ? 'text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                                                }`}
                                                style={selecionada ? { backgroundColor: tag.cor || '#3b82f6', borderColor: tag.cor || '#3b82f6' } : {}}
                                            >
                                                {selecionada && <Check size={12} />}
                                                {tag.nome}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {saving ? 'A salvar...' : 'Salvar Aposta'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE CASHOUT */}
            {cashoutBet && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full p-6 space-y-4 border border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Registrar Cash-out</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Informe quanto foi resgatado nesta aposta.
                        </p>

                        <form onSubmit={handleCashoutSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                                    Valor resgatado (R$)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    required
                                    autoFocus
                                    value={cashoutValue}
                                    onChange={(e) => setCashoutValue(e.target.value)}
                                    className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg p-2.5 text-sm outline-none"
                                    placeholder="75.00"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCashoutBet(null);
                                        setCashoutValue('');
                                    }}
                                    className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {saving ? 'A salvar...' : 'Confirmar Cash-out'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}