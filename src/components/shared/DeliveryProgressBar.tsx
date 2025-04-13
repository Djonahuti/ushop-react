import { cn } from '@/lib/utils'

const orderStages = [
  'Pending',
  'Paid',
  'Payment confirmed',
  'WAITING TO BE SHIPPED',
  'SHIPPED',
  'OUT FOR DELIVERY',
  'RECEIVED',
]

type Props = {
  status: string
}

export default function DeliveryProgressBar({ status }: Props) {
  const currentIndex = orderStages.findIndex(
    stage => stage.toLowerCase() === status.toLowerCase()
  )

  return (
    <div className="w-full flex flex-col items-center mt-4">
      <div className="flex justify-between w-full relative">
        {orderStages.map((stage, index) => {
          const isPast = index < currentIndex
          const isCurrent = index === currentIndex

          return (
            <div key={stage} className="flex-1 flex flex-col items-center text-center relative z-10">
              <div
                className={cn(
                  'w-4 h-4 rounded-full border-2',
                  isPast
                    ? 'bg-green-500 border-green-500'
                    : isCurrent
                    ? 'bg-yellow-500 border-yellow-500 animate-pulse'
                    : 'bg-white border-gray-300'
                )}
              />
              <p
                className={cn(
                  'text-[10px] mt-1 w-[60px]',
                  isPast
                    ? 'text-green-600'
                    : isCurrent
                    ? 'text-yellow-600 font-semibold'
                    : 'text-gray-400'
                )}
              >
                {stage}
              </p>
            </div>
          )
        })}
        
      {/* Connecting line */}
      <div className="absolute top-2 w-full h-0.5 bg-gray-300 z-0">
        <div
          className="h-0.5 bg-green-500 transition-all duration-500"
          style={{
            width: `${(currentIndex / (orderStages.length - 1)) * 100}%`
          }}
        />
      </div>        
      </div>


    </div>
  )
}
