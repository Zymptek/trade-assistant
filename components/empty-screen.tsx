import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const exampleMessages = [
  {
    heading: 'What is the HTS code for electric vehicles?',
    message: 'What is the HTS code for electric vehicles?'
  },
  {
    heading: 'Current tariffs on steel imports from China',
    message: 'What are the current tariffs on steel imports from China?'
  },
  {
    heading: 'Explain INCOTERMS: FOB vs CIF',
    message: 'Explain the difference between FOB and CIF INCOTERMS'
  },
  {
    heading: 'Requirements for FDA-regulated imports',
    message: 'What are the documentation requirements for FDA-regulated imports?'
  }
]
export function EmptyScreen({
  submitMessage,
  className
}: {
  submitMessage: (message: string) => void
  className?: string
}) {
  return (
    <div className={`mx-auto w-full transition-all ${className}`}>
      <div className="bg-card/50 p-8 rounded-2xl border border-border/50 backdrop-blur-sm shadow-lg">
        <p className="text-muted-foreground text-center mb-6 text-lg leading-relaxed">Ask questions about HTS codes, tariffs, customs regulations and international trade</p>
        <div className="mt-2 flex flex-col items-start space-y-3 mb-4">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start h-auto p-4 text-base hover:bg-accent/50 hover:border-primary/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-md group"
              name={message.message}
              onClick={async () => {
                submitMessage(message.message)
              }}
            >
              <ArrowRight size={16} className="mr-3 text-blue-500 group-hover:text-blue-600 transition-colors" />
              <span className="text-left">{message.heading}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
