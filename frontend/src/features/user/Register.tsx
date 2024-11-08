'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'

const formSchema = z.object({
  firstName: z.string().min(1, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(1, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 8 characters' }),
  passwordConfirmation: z.string(),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "Passwords don't match",
  path: ["passwordConfirmation"],
})

export default function Register() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      passwordConfirmation: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      console.log(values)
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-[400px]">
        <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>Create a new account to get started.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex space-x-4">
                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                    <FormItem className="flex-1">
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                        <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                    <FormItem className="flex-1">
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                        <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </div>
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input type="email" placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="passwordConfirmation"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder="Confirm your password" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                    </>
                ) : (
                    'Create Account'
                )}
                </Button>
            </form>
            </Form>
            <div className="mt-4 text-center">
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Login to existing account
                </Button>
              </Link>
            </div>
        </CardContent>
        </Card>
    </div>
  )
}