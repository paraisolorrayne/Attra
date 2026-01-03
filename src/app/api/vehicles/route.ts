import { NextRequest, NextResponse } from 'next/server'
import { getVehicles, type AutoConfFilters } from '@/lib/autoconf-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const brand = searchParams.get('brand')
    const search = searchParams.get('search') // General text search
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const minYear = searchParams.get('minYear')
    const maxYear = searchParams.get('maxYear')
    const sort = searchParams.get('sort') || 'publicacao'
    const order = searchParams.get('order') || 'desc'
    const tipo = searchParams.get('tipo') as 'carros' | 'motos' | 'caminhoes' | null

    // Build AutoConf filters
    const filters: AutoConfFilters = {
      tipo: tipo || 'carros',
      pagina: page,
      registros_por_pagina: limit,
    }

    // Map sort parameter to AutoConf format
    if (sort === 'price' || sort === 'preco') {
      filters.ordenar = 'preco'
    } else if (sort === 'year' || sort === 'ano') {
      filters.ordenar = 'ano'
    } else if (sort === 'mileage' || sort === 'km') {
      filters.ordenar = 'km'
    } else {
      filters.ordenar = 'publicacao'
    }

    filters.ordem = order as 'asc' | 'desc'

    // Apply price filters
    if (minPrice) {
      filters.preco_de = parseInt(minPrice)
    }
    if (maxPrice) {
      filters.preco_ate = parseInt(maxPrice)
    }

    // Apply year filters
    if (minYear) {
      filters.ano_de = parseInt(minYear)
    }
    if (maxYear) {
      filters.ano_ate = parseInt(maxYear)
    }

    // Fetch from AutoConf API
    const result = await getVehicles(filters)

    // Filter by brand on our side if specified (AutoConf may not support text search)
    let vehicles = result.vehicles

    // Apply brand filter
    if (brand) {
      const brandLower = brand.toLowerCase()
      vehicles = vehicles.filter(v =>
        v.brand.toLowerCase().includes(brandLower) ||
        v.model.toLowerCase().includes(brandLower)
      )
    }

    // Apply general search filter (searches across brand, model, version)
    if (search) {
      const searchLower = search.toLowerCase().trim()
      const searchTerms = searchLower.split(/\s+/) // Split by whitespace for multi-word search

      vehicles = vehicles.filter(v => {
        const searchText = `${v.brand} ${v.model} ${v.version || ''}`.toLowerCase()
        // All search terms must be present somewhere in the search text
        return searchTerms.every(term => searchText.includes(term))
      })
    }

    return NextResponse.json({
      success: true,
      vehicles, // Also return as 'vehicles' for admin panel compatibility
      data: vehicles,
      pagination: {
        page: result.page,
        limit,
        total: vehicles.length, // Update total to reflect filtered count
        totalPages: Math.ceil(vehicles.length / limit),
      },
    })
  } catch (error) {
    console.error('Vehicles API error:', error)
    return NextResponse.json(
      { success: false, message: 'Erro ao buscar veículos', error: String(error) },
      { status: 500 }
    )
  }
}

