import { useEffect, useRef, useState } from 'react'
import { createChart, CandlestickSeries } from 'lightweight-charts'
import { IntervalButton } from './ui/interval-button'

// Types pour les données de l'API
type CandleRow = {
  time: string
  timestamp: string
  open: string
  high: string
  low: string
  close: string
}

// Configuration des intervalles
const INTERVALS = [
  { s: 60, label: "1M" },
  { s: 300, label: "5M" },
  { s: 900, label: "15M" },
  { s: 1800, label: "30M" },
  { s: 3600, label: "1H" },
  { s: 14400, label: "4H" },
]

interface TradingChartProps {
  pairId?: number;
  theme?: 'light' | 'dark';
}

export const TradingChart = ({ pairId = 6004, theme = 'dark' }: TradingChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  const seriesRef = useRef<any>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  
  const [currentInterval, setCurrentInterval] = useState(900) // Défaut 15m
  const [loadingInterval, setLoadingInterval] = useState<number | null>(null)

  // Initialisation du graphique
  useEffect(() => {
    if (!chartContainerRef.current) return

    // Configuration du thème basée sur le prop theme
    const themeConfig = theme === 'dark' ? {
      layout: {
        background: { color: 'hsl(var(--background))' },
        textColor: 'hsl(var(--foreground))',
      },
      grid: {
        vertLines: { color: 'hsl(var(--border))' },
        horzLines: { color: 'hsl(var(--border))' },
      },
      crosshair: {
        mode: 1, // Normal
        vertLine: {
          color: 'hsl(var(--muted-foreground))',
          style: 2, // Dashed
        },
        horzLine: {
          color: 'hsl(var(--muted-foreground))',
          style: 2, // Dashed
        },
      },
      rightPriceScale: {
        borderColor: 'hsl(var(--border))',
        textColor: 'hsl(var(--foreground))',
      },
      timeScale: {
        borderColor: 'hsl(var(--border))',
        timeVisible: true,
        secondsVisible: false,
      },
    } : {
      layout: {
        background: { color: 'hsl(var(--background))' },
        textColor: 'hsl(var(--foreground))',
      },
      grid: {
        vertLines: { color: 'hsl(var(--border))' },
        horzLines: { color: 'hsl(var(--border))' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: 'hsl(var(--muted-foreground))',
          style: 2,
        },
        horzLine: {
          color: 'hsl(var(--muted-foreground))',
          style: 2,
        },
      },
      rightPriceScale: {
        borderColor: 'hsl(var(--border))',
        textColor: 'hsl(var(--foreground))',
      },
      timeScale: {
        borderColor: 'hsl(var(--border))',
        timeVisible: true,
        secondsVisible: false,
      },
    }

    // Configuration du graphique
    const chart = createChart(chartContainerRef.current, {
      ...themeConfig,
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    })

    // Création de la série candlestick avec couleurs du thème
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: 'hsl(var(--primary))', // Couleur haussière (bleu du thème)
      downColor: 'hsl(var(--destructive))', // Couleur baissière (rouge du thème)
      borderUpColor: 'hsl(var(--primary))',
      borderDownColor: 'hsl(var(--destructive))',
      wickUpColor: 'hsl(var(--primary))',
      wickDownColor: 'hsl(var(--destructive))',
    })

    chartRef.current = chart
    seriesRef.current = candlestickSeries

    // Gestion du redimensionnement
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        })
      }
    }

    resizeObserverRef.current = new ResizeObserver(handleResize)
    resizeObserverRef.current.observe(chartContainerRef.current)

    // Chargement initial des données
    fetchData(currentInterval)

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
      }
      chart.remove()
    }
  }, [theme]) // Ajouter theme comme dépendance

  // Fonction pour récupérer les données depuis l'API
  const fetchData = async (intervalSeconds: number) => {
    setLoadingInterval(intervalSeconds)
    
    try {
      const response = await fetch(
        `https://chart.brokex.trade/history?pair=${pairId}&interval=${intervalSeconds}`,
        { cache: "no-store" }
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: CandleRow[] = await response.json()
      
      // Conversion des données pour Lightweight Charts
      const ohlc = data.map(d => ({
        time: Math.floor(Number(d.time) / 1000), // Conversion millisecondes -> secondes
        open: Number(d.open),
        high: Number(d.high),
        low: Number(d.low),
        close: Number(d.close),
      }))

      // Application des données à la série
      if (seriesRef.current) {
        seriesRef.current.setData(ohlc)
        
        // Ajustement de la vue pour afficher toutes les données
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent()
        }
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoadingInterval(null)
    }
  }

  // Gestion du changement d'intervalle
  const handleIntervalChange = (intervalSeconds: number) => {
    if (intervalSeconds !== currentInterval && loadingInterval === null) {
      setCurrentInterval(intervalSeconds)
      fetchData(intervalSeconds)
    }
  }

  // Recharger les données quand pairId change
  useEffect(() => {
    if (pairId && chartRef.current && seriesRef.current) {
      fetchData(currentInterval)
    }
  }, [pairId])

  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Barre d'outils avec les boutons d'intervalle */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          {INTERVALS.map((interval) => (
            <IntervalButton
              key={interval.s}
              isActive={currentInterval === interval.s}
              isLoading={loadingInterval === interval.s}
              onClick={() => handleIntervalChange(interval.s)}
              className="min-w-[3rem]"
              size="sm"
            >
              {interval.label}
            </IntervalButton>
          ))}
        </div>
        
        {pairId && (
          <div className="text-sm text-muted-foreground">
            ID #{pairId}
          </div>
        )}
      </div>

      {/* Container du graphique */}
      <div 
        ref={chartContainerRef}
        className="flex-1 w-full bg-card border border-border rounded-lg overflow-hidden"
      />
    </div>
  )
}