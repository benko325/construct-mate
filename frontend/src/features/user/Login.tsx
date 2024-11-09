import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import agent from "@/app/api/agent"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  })

export default function Login() {
    // const navigate = useNavigate();
    // const dispatch = useAppDispatch();

    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
        email: '',
        password: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
          await agent.Account.login({email: values.email, password: values.password});
    
        //   if (response.ok) {
        //     // Handle successful login
        //     console.log('Login successful')
        //     // Redirect or update UI as needed
        //   } else {
        //     // Handle error response
        //     const errorData = await response.json()
        //     console.error('Login failed:', errorData)
        //     form.setError('root', {
        //       type: 'manual',
        //       message: errorData.message || 'Login failed. Please try again.',
        //     })
        //   }
        } catch (error) {
          console.error('Login error:', error)
          form.setError('root', {
            type: 'manual',
            message: 'An error occurred. Please try again.',
          })
        } finally {
          setIsLoading(false)
        }
    }
    
    return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="mx-auto max-w-sm">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Login</CardTitle>
                <CardDescription>Enter your email and password to login to your account</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your email" {...field} />
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
                        {form.formState.errors.root && (
                        <div className="text-red-500 text-sm mt-2">
                            {form.formState.errors.root.message}
                        </div>
                        )}
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Please wait
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>
                </Form>
                <div className="mt-4 text-center">
                    <Link to="/register">
                        <Button variant="outline" className="w-full">
                            Create an account
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}