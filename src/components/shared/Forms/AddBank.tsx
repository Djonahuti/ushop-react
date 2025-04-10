import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import supabase from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const schema = z.object({
  bank_name: z.string().min(1, 'Bank Name is required'),
  account_number: z.string().min(1, 'Account Number is required'),
  account_name: z.string().min(1, 'Bank Name is required'),
});

type FormData = z.infer<typeof schema>;

const AddBank: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [isPending, setIsPending] = useState(false);


  const onSubmit = async (data: FormData) => {
    setIsPending(true);

    // Insert bank data into the database
    const { error } = await supabase
      .from('banks')
      .insert({
        bank_name: data.bank_name,
        account_number: data.account_number,
        account_name: data.account_name,
      });

    if (error) {
      console.error('Error adding bank:', error.message);
        toast.error('Error adding bank: ' + error.message);
    } else {
      console.log('Bank added successfully');
      toast.success('Bank added successfully!');
      // Optionally, reset the form or show a success message
    }
    setIsPending(false);
  };

  return (
    <Card className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add Bank</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="bank_name">Bank Name</Label>
          <Input
            id="bank_name"
            {...register('bank_name')}
            placeholder="Enter Bank Name"
          />
          {errors.bank_name && <span className="text-red-500">{errors.bank_name.message}</span>}
        </div>
        <div>
          <Label htmlFor="account_number">Account Number</Label>
          <Input
            id="account_number"
            {...register('account_number')}
            placeholder="Enter Account Number"
          />
          {errors.account_number && <span className="text-red-500">{errors.account_number.message}</span>}
        </div>
        <div>
          <Label htmlFor="account_name">Account Name</Label>
          <Input
            id="account_name"
            {...register('account_name')}
            placeholder="Enter Account Name"
          />
          {errors.account_name && <span className="text-red-500">{errors.account_name.message}</span>}
        </div>
        <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            {isPending ? 'Adding...' : 'Add Bank'}
        </Button>
      </form>
    </Card>
  );
};

export default AddBank;