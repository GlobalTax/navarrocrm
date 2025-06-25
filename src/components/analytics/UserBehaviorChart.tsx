
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface UserBehaviorData {
  time: string
  pageViews: number
  clicks: number
  timeOnSite: number
}

interface UserBehaviorChartProps {
  data: UserBehaviorData[]
  className?: string
}

export const UserBehaviorChart = ({ data, className = '' }: UserBehaviorChartProps) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Actividad del Usuario</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="pageViews"
              stroke="#8884d8"
              strokeWidth={2}
              name="Páginas vistas"
            />
            <Line
              type="monotone"
              dataKey="clicks"
              stroke="#82ca9d"
              strokeWidth={2}
              name="Clics"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
