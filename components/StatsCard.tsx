import { calculateTrendPercentage } from "~/lib/utils"

const StatsCard = ({
    headerTitle,
    total,
    currentMonthCount,
    lastMonthCount
}: StatsCard) => {
    const {trend, percentage} = calculateTrendPercentage(currentMonthCount, lastMonthCount)

  return (
    <div>
      
    </div>
  )
}

export default StatsCard
