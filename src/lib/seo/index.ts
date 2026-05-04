/**
 * SEO Content — 8 Blocos
 *
 * Estrutura completa de conteúdo SEO para captura de intenção de compra.
 *
 * Bloco 1: Páginas de Modelo (core)
 * Bloco 2: Páginas de Preço
 * Bloco 3: Condição (seminovos / supercarros)
 * Bloco 4: Faixa de Preço
 * Bloco 5: Perfil do Comprador (contexto de uso)
 * Bloco 6: Guias Operacionais (colecionadores)
 * Bloco 7: Confiança (processo, garantia, entrega)
 * Bloco 8: Importação
 */

export { type ModeloPage, MODELOS } from './modelos'
export { type PrecoPage, PRECOS } from './precos'
export { type CondicaoPage, CONDICOES } from './condicao'
export { type FaixaPrecoPage, FAIXAS_PRECO } from './faixa-preco'
export { type PerfilComprador, PERFIS_COMPRADOR } from './perfil'
export { type GuiaOperacional, GUIAS_OPERACIONAIS } from './guias'
export { type ConfiancaPage, CONFIANCA_PAGES } from './confianca'
export { type ImportacaoMain, IMPORTACAO_MAIN, type ImportacaoMarca, IMPORTACAO_MARCAS } from './importacao'

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

import { MODELOS } from './modelos'
import { PRECOS } from './precos'
import { CONDICOES } from './condicao'
import { FAIXAS_PRECO } from './faixa-preco'
import { PERFIS_COMPRADOR } from './perfil'
import { GUIAS_OPERACIONAIS } from './guias'
import { CONFIANCA_PAGES } from './confianca'
import { IMPORTACAO_MARCAS } from './importacao'

export function findModelo(slug: string) {
	return MODELOS.find(m => m.slug === slug)
}
export function findPreco(slug: string) {
	return PRECOS.find(p => p.slug === slug)
}
export function findCondicao(slug: string) {
	return CONDICOES.find(c => c.slug === slug)
}
export function findFaixaPreco(slug: string) {
	return FAIXAS_PRECO.find(f => f.slug === slug)
}
export function findPerfil(slug: string) {
	return PERFIS_COMPRADOR.find(p => p.slug === slug)
}
export function findGuiaOperacional(slug: string) {
	return GUIAS_OPERACIONAIS.find(g => g.slug === slug)
}
export function findConfianca(slug: string) {
	return CONFIANCA_PAGES.find(c => c.slug === slug)
}
export function findImportacaoMarca(slug: string) {
	return IMPORTACAO_MARCAS.find(m => m.slug === slug)
}
