import { cn } from '@/lib/utils'
import { Progress } from '../ui/progress'

const orderStages = [
  { label: 'Pending', short: 'Pending' },
  { label: 'Paid', short: 'Paid' },
  { label: 'Payment confirmed', short: 'Confirmed' },
  { label: 'WAITING TO BE SHIPPED', short: 'To Ship' },
  { label: 'SHIPPED', short: 'Shipped' },
  { label: 'OUT FOR DELIVERY', short: 'Delivery' },
  { label: 'DELIVERED', short: 'Arrived' },
  { label: 'COMPLETED', short: 'Done' }
]

type Props = {
  status: string
}

export default function DeliveryProgressBar({ status }: Props) {
  const currentIndex = orderStages.findIndex(
    s => s.label.toLowerCase() === status.toLowerCase()
  )

  const percentage = ((currentIndex + 1) / orderStages.length) * 100

  return (
    <div className="w-full mt-4 space-y-3">
      {/* Progress bar */}
      <Progress value={percentage} className="h-2 bg-muted" />

      {/* Step labels */}
      <div className="grid grid-cols-8 gap-1 text-[8px] text-center text-muted-foreground md:text-xs">
        {orderStages.map((stage, index) => (
          <div
            key={stage.label}
            className={cn(
              'truncate',
              index < currentIndex
                ? 'text-green-600'
                : index === currentIndex
                ? 'text-yellow-600 font-semibold'
                : 'text-gray-400'
            )}
          >
            {stage.short}
          </div>
        ))}
      </div>


    </div>
  )
}
