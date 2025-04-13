import { cn } from '@/lib/utils'

const orderStages = [
  'Pending',
  'Paid',
  'Payment confirmed',
  'WAITING TO BE SHIPPED',
  'SHIPPED',
  'OUT FOR DELIVERY',
  'COMPLETED',
]

type Props = {
  status: string
}

export default function DeliveryTimeline({ status }: Props) {
  const currentIndex = orderStages.findIndex(stage => stage.toLowerCase() === status.toLowerCase())

  return (
    <div className="flex flex-col space-y-4 mt-4">
      {orderStages.map((stage, index) => (
        <div key={stage} className="flex items-center gap-2">
          <div
            className={cn(
              'w-4 h-4 rounded-full border-2',
              index < currentIndex
                ? 'bg-green-500 border-green-500'
                : index === currentIndex
                ? 'bg-yellow-500 border-yellow-500 animate-pulse'
                : 'border-gray-300'
            )}
          />
          <p
            className={cn(
              'text-sm',
              index < currentIndex
                ? 'text-green-600'
                : index === currentIndex
                ? 'text-yellow-600 font-semibold'
                : 'text-gray-400'
            )}
          >
            {stage}
          </p>
        </div>
      ))}
    </div>
  )
}
