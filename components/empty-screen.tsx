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
      <div className="bg-background p-8 rounded-lg border border-border">
        <p className="text-muted-foreground text-center mb-6">Ask questions about HTS codes, tariffs, customs regulations and international trade</p>
        <div className="mt-2 flex flex-col items-start space-y-3 mb-4">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start h-auto p-3 text-base hover:bg-muted/50 transition-colors"
              name={message.message}
              onClick={async () => {
                submitMessage(message.message)
              }}
            >
              <ArrowRight size={16} className="mr-2 text-primary" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
