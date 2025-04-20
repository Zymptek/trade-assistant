'use client'

import { updateUserProfile, UserProfile } from '@/lib/actions/user'
import { countries } from '@/lib/data/countries'
import { cn } from '@/lib/utils'
import { Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Textarea } from '../ui/textarea'

interface ProfileFormProps {
  initialData?: Partial<UserProfile>
  userId: string
}

// Role options - Trade-specific functions
const roles = [
  { value: 'importer', label: 'Importer' },
  { value: 'exporter', label: 'Exporter' },
  { value: 'procurement', label: 'Procurement Manager' },
  { value: 'logistics', label: 'Logistics Manager' },
  { value: 'customs', label: 'Customs Broker' },
  { value: 'compliance', label: 'Compliance Officer' },
  { value: 'consultant', label: 'Trade Consultant' },
  { value: 'freight', label: 'Freight Forwarder' },
  { value: 'supply_chain', label: 'Supply Chain Manager' },
  { value: 'trade_finance', label: 'Trade Finance Specialist' },
  { value: 'other', label: 'Other' }
]

// Industry options
const industries = [
  { value: 'agriculture', label: 'Agriculture & Food' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'chemicals', label: 'Chemicals' },
  { value: 'construction', label: 'Construction & Building Materials' },
  { value: 'consumer_goods', label: 'Consumer Goods' },
  { value: 'electronics', label: 'Electronics & Technology' },
  { value: 'energy', label: 'Energy & Utilities' },
  { value: 'fashion', label: 'Fashion & Textiles' },
  { value: 'healthcare', label: 'Healthcare & Pharmaceuticals' },
  { value: 'industrial', label: 'Industrial Equipment' },
  { value: 'metals', label: 'Metals & Mining' },
  { value: 'retail', label: 'Retail' },
  { value: 'shipping', label: 'Shipping & Logistics' },
  { value: 'software', label: 'Software & IT' },
  { value: 'other', label: 'Other' }
]

// Form steps
const steps = [
  { id: 'personal', title: 'Personal Information' },
  { id: 'professional', title: 'Professional Details' },
  { id: 'trade', title: 'Trade Preferences' }
]

export function ProfileForm({ initialData, userId }: ProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<UserProfile>>(initialData || {})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [openCountry, setOpenCountry] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  // Process name if it exists in initialData
  useState(() => {
    if (initialData?.name && !initialData.firstName && !initialData.lastName) {
      const nameParts = initialData.name.split(' ')
      if (nameParts.length >= 2) {
        const lastName = nameParts.pop() || ''
        const firstName = nameParts.join(' ')
        setFormData(prev => ({
          ...prev,
          firstName,
          lastName
        }))
      }
    }
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (step === 0) { // Personal Information
      if (!formData.firstName?.trim()) {
        newErrors.firstName = 'First name is required'
      }
      
      if (!formData.lastName?.trim()) {
        newErrors.lastName = 'Last name is required'
      }
      
      if (!formData.phone?.trim()) {
        newErrors.phone = 'Phone number is required'
      } else if (!/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(formData.phone.trim())) {
        newErrors.phone = 'Please enter a valid phone number'
      }
      
      if (!formData.country) {
        newErrors.country = 'Country is required'
      }
    } 
    else if (step === 1) { // Professional Details
      if (!formData.organization?.trim()) {
        newErrors.organization = 'Organization is required'
      }
      
      if (!formData.role) {
        newErrors.role = 'Role is required'
      }
      
      if (!formData.industry) {
        newErrors.industry = 'Industry is required'
      }
    }
    else if (step === 2) { // Trade Preferences
      if (!formData.bio?.trim()) {
        newErrors.bio = 'Please provide a brief description'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < steps.length - 1) {
      setCurrentStep(current => current + 1)
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(current => current - 1)
      window.scrollTo(0, 0)
    }
  }
  
  const validateForm = (): boolean => {
    // Validate all steps
    const personalValid = validateStep(0)
    
    if (!personalValid) {
      setCurrentStep(0)
      return false
    }
    
    const professionalValid = validateStep(1)
    
    if (!professionalValid) {
      setCurrentStep(1)
      return false
    }
    
    const tradeValid = validateStep(2)
    
    if (!tradeValid) {
      setCurrentStep(2)
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    // Combine first and last name into name field
    const fullName = `${formData.firstName} ${formData.lastName}`.trim()
    
    // Create the profile data with explicit onboardingCompleted flag
    const profileData = {
      ...formData,
      name: fullName,
      userId,
      onboardingCompleted: true // Explicitly set to true (boolean)
    }
    
    // Log the profile data being submitted
    console.log("Submitting profile data:", profileData)
    
    setIsLoading(true)
    try {
      const success = await updateUserProfile(userId, profileData)

      if (success) {
        toast.success('Profile updated', {
          description: 'Your profile information has been saved successfully.'
        })
        
        router.refresh()
        // Wait a bit longer to ensure data is saved before redirecting
        setTimeout(() => {
          // Create a custom URL for redirect that includes metadata
          const homeUrl = new URL('/', window.location.origin)
          
          // Force full page reload to ensure middleware picks up the new profile state
          // Use location.replace instead of href to prevent back button issues
          window.location.replace(homeUrl.toString())
        }, 2000)
      } else {
        toast.error('Error', {
          description: 'Failed to update profile. Please try again.'
        })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Error', {
        description: 'An unexpected error occurred. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader className="bg-muted/50">
        <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
        <CardDescription>
          Please provide your information to enhance your experience and receive personalized trade assistance.
        </CardDescription>
        
        {/* Stepper */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div 
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border text-sm font-medium mb-2",
                    currentStep === index 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : currentStep > index 
                        ? "bg-primary/20 text-primary border-primary/40" 
                        : "bg-muted text-muted-foreground border-input"
                  )}
                >
                  {index + 1}
                </div>
                <div className="text-xs font-medium text-center">{step.title}</div>
              </div>
            ))}
          </div>
          
          <div className="relative mt-2 h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </CardHeader>
      
      <form onSubmit={currentStep === steps.length - 1 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
        <CardContent className="p-6 space-y-6">
          {/* Step 1: Personal Information */}
          {currentStep === 0 && (
            <>
              <div className="space-y-1">
                <h3 className="text-base font-medium">Personal Information</h3>
                <p className="text-sm text-muted-foreground">
                  Please provide your contact details for account purposes.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Your first name"
                    value={formData.firstName || ''}
                    onChange={handleChange}
                    className={errors.firstName ? 'border-red-500' : ''}
                  />
                  {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Your last name"
                    value={formData.lastName || ''}
                    onChange={handleChange}
                    className={errors.lastName ? 'border-red-500' : ''}
                  />
                  {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Your email address"
                    value={formData.email || ''}
                    onChange={handleChange}
                    disabled
                    className="bg-muted/30"
                  />
                  <p className="text-xs text-muted-foreground">Email address cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Your phone number"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="country">Country *</Label>
                  <Popover open={openCountry} onOpenChange={setOpenCountry}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCountry}
                        className={cn(
                          "w-full justify-between",
                          errors.country ? 'border-red-500' : '',
                          !formData.country && "text-muted-foreground"
                        )}
                      >
                        {formData.country
                          ? countries.find((country) => country.value === formData.country)?.label
                          : "Select your country"}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                      <Command className="w-full">
                        <CommandInput placeholder="Search country..." />
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-y-auto">
                          {countries.map((country) => (
                            <CommandItem
                              key={country.value}
                              value={country.value}
                              className="aria-selected:bg-primary aria-selected:text-primary-foreground"
                              onSelect={(currentValue) => {
                                handleSelectChange('country', currentValue)
                                setOpenCountry(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.country === country.value
                                    ? "opacity-100 text-primary"
                                    : "opacity-0"
                                )}
                              />
                              {country.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
                </div>
              </div>
            </>
          )}
          
          {/* Step 2: Professional Details */}
          {currentStep === 1 && (
            <>
              <div className="space-y-1">
                <h3 className="text-base font-medium">Professional Details</h3>
                <p className="text-sm text-muted-foreground">
                  Information about your organization and professional background.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization/Company *</Label>
                  <p className="text-xs text-muted-foreground">Your organization name</p>
                  <Input
                    id="organization"
                    name="organization"
                    placeholder="Your organization name"
                    value={formData.organization || ''}
                    onChange={handleChange}
                    className={errors.organization ? 'border-red-500' : ''}
                  />
                  {errors.organization && <p className="text-sm text-red-500">{errors.organization}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <p className="text-xs text-muted-foreground">Your position within the organization</p>
                  <Input
                    id="jobTitle"
                    name="jobTitle"
                    placeholder="E.g., Director, Manager, Specialist"
                    value={formData.jobTitle || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <p className="text-xs text-muted-foreground">Business sector your organization operates in</p>
                  <Select 
                    value={formData.industry || ''} 
                    onValueChange={(value) => handleSelectChange('industry', value)}
                  >
                    <SelectTrigger className={errors.industry ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry.value} value={industry.value}>
                          {industry.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.industry && <p className="text-sm text-red-500">{errors.industry}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Trade Role *</Label>
                  <p className="text-xs text-muted-foreground">Your function in the trade process</p>
                  <Select 
                    value={formData.role || ''} 
                    onValueChange={(value) => handleSelectChange('role', value)}
                  >
                    <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select your trade role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
                </div>
              </div>
            </>
          )}
          
          {/* Step 3: Trade Preferences */}
          {currentStep === 2 && (
            <>
              <div className="space-y-1">
                <h3 className="text-base font-medium">Trade Preferences</h3>
                <p className="text-sm text-muted-foreground">
                  Help us personalize your experience by sharing your specific trade needs.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="tradeRegions">Primary Trade Regions</Label>
                  <Input
                    id="tradeRegions"
                    name="tradeRegions"
                    placeholder="E.g., Asia, Europe, North America"
                    value={formData.tradeRegions || ''}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-muted-foreground">Regions you typically import from or export to</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Description of Trade Needs *</Label>
                  <p className="text-xs text-muted-foreground">
                    Briefly describe your trade activities, specific needs, and challenges. This helps our AI provide more personalized and relevant assistance.
                  </p>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="E.g., I import electronics from Asia to North America and need assistance with HTS classifications, duty calculations, and compliance requirements. I'm especially interested in learning about FTAs that might apply to my shipments."
                    value={formData.bio || ''}
                    onChange={handleChange}
                    rows={4}
                    className={errors.bio ? 'border-red-500' : ''}
                  />
                  {errors.bio && <p className="text-sm text-red-500">{errors.bio}</p>}
                </div>
              </div>
            </>
          )}
        </CardContent>
        
        <CardFooter className="bg-muted/30 px-6 py-4 flex flex-col space-y-4">
          <div className="flex justify-between w-full">
            <Button 
              type="button" 
              onClick={prevStep} 
              disabled={currentStep === 0 || isLoading}
              variant="outline"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button 
                type="submit"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Complete Profile'}
              </Button>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
          </p>
        </CardFooter>
      </form>
    </Card>
  )
} 