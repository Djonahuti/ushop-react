'use client'

import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import supabase from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'

const schema = z.object({
    customer_id: z.number(),
    subject_id:z.coerce.number().optional(),
    message: z.string().min(3, 'Please be specific'),
})

type ContactFormData = z.infer<typeof schema>

export default function Contact() {
    const navigate = useNavigate()
    const [subject, setSubject] = useState<{ subject: string; subject_id: number }[]>([])

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<ContactFormData>({
        resolver: zodResolver(schema),
    })

    useEffect(() => {
        const fetchCustomer = async () => {
          const {
            data: { user },
            error,
          } = await supabase.auth.getUser()
      
          if (error || !user) {
            toast.error('You must be logged in')
            navigate('/login') // Or wherever your login page is
            return
          }
      
          // Assuming your `customer_id` is the same as user.id or stored in a customer table
          // If it's user.id:
          const { data: customerData, error: customerError } = await supabase
            .from('customers')
            .select('customer_id')
            .eq('customer_email', user?.email)
            .single()
      
          if (customerError || !customerData) {
            toast.error('Customer not found')
            navigate('/overview')
          } else {
            setValue('customer_id', customerData.customer_id)
          }
        }
      
        fetchCustomer()
      }, [navigate, setValue])
      

      useEffect(() => {
        const fetchSubject = async () => {
          const { data, error } = await supabase.from('subject').select('*')
          if (error) return toast.error('Failed to load subject')
          setSubject(data || [])
        }
        fetchSubject()
      }, [])
      
      const onSubmit = async (data: ContactFormData) => {
        const { error } = await supabase.from('contacts').insert({
          ...data,
        })
    
        if (error) {
          toast.error('Failed to submit Contact')
        } else {
          toast.success('Thanks! We will get back to you as soon as possible')
          navigate('/overview')
        }
      }      

  return (
    <div className='max-w-xl mx-auto p-4'>
        <Card>
            <CardContent className="p-6 space-y-4">
                <h2 className='text-xl font-bold'>Leave a Message</h2>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                    <Input type="hidden" {...register('customer_id')} />

                    {/* Subject */}
                    <div className="space-y-2">
                    <Label>Select Subject</Label>
                    <Controller
                        name="subject_id"
                        control={control}
                        render={({ field }) => (
                        <Select onValueChange={(value) => field.onChange(Number(value))}>
                            <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                            {subject.map(sbj => (
                                <SelectItem key={sbj.subject_id} value={String(sbj.subject_id)}>
                                {sbj.subject}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        )}
                    />
                    {errors.subject_id && <p className="text-red-500 text-sm">{errors.subject_id.message}</p>}
                    </div> 

                    {/* Message */}
                    <div className="space-y-2">
                        <Label>Message</Label>
                        <Textarea placeholder="Your message..." {...register('message')} />
                        {errors.message && <p className="text-red-500 text-sm">{errors.message.message}</p>}
                    </div>

                    <Button type="submit" className="w-full">Submit</Button>                   
                </form>
            </CardContent>
        </Card>
    </div>
  )
}

