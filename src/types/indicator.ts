export type IndicatorKey =
  | 'market'
  | 'institution'
  | 'production'
  | 'experiment'
  | 'participation'
  | 'influence'

export type Indicator = {
  key: IndicatorKey
  label: string
  score: number
  uncertainty: number
  sourceCount: number
}
